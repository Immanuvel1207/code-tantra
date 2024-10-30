// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/leetcode_clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Schema
const questionSchema = new mongoose.Schema({
    name: String,
    description: String,
    inputFormat: String,
    outputFormat: String,
    sampleInput: String,
    sampleOutput: String,
    testCases: [
        {
            input: String,
            output: String,
        },
    ],
});

const Question = mongoose.model('Question', questionSchema);

// API Endpoints

// Fetch all questions
app.get('/questions', async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Fetch a single question by ID
app.get('/questions/:id', async (req, res) => {
    const { id } = req.params;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid question ID' });
    }

    try {
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

const JUDGE0_API_KEY = '8203003cc9msh73efd106e65683dp17af63jsn5c142137ad64';
const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com/submissions';

app.post('/run-code', async (req, res) => {
  const { code, language, testCases } = req.body;

  const languageMap = {
      javascript: 63, // JavaScript
      python: 71, // Python
      cpp: 54, // C++
      java: 62, // Java
  };

  const languageId = languageMap[language];
  const results = [];

  try {
      // Run the code for each test case
      for (const testCase of testCases) {
          const { input, output: expectedOutput } = testCase;

          // Submit code to Judge0
          const { data } = await axios.post(
              JUDGE0_URL,
              {
                  source_code: code,
                  language_id: languageId,
                  stdin: input,
              },
              {
                  headers: {
                      'Content-Type': 'application/json',
                      'X-RapidAPI-Key': JUDGE0_API_KEY,
                      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                  },
              }
          );

          const submissionId = data.token;

          // Poll Judge0 for the result
          const getResult = async () => {
              const { data: result } = await axios.get(`${JUDGE0_URL}/${submissionId}`, {
                  headers: {
                      'X-RapidAPI-Key': '8203003cc9msh73efd106e65683dp17af63jsn5c142137ad64',
                      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                  },
              });
              return result;
          };

          // Wait for the result to be ready
          let result = await getResult();
          while (result.status.id <= 2) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              result = await getResult();
          }

          const actualOutput = (result.stdout || '');
          const passed = actualOutput === expectedOutput;

          // Add result summary for each test case
          results.push({
              input,
              expectedOutput,
              actualOutput,
              passed,
          });
      }

      // Summarize the test results
      const passedCount = results.filter(result => result.passed).length;
      res.json({
          totalTestCases: testCases.length,
          passedTestCases: passedCount,
          results,
      });
  } catch (error) {
      console.error('Error executing code:', error);
      res.status(500).send('Error executing code');
  }
});


const UserSubmission = require('./models/UserSubmission');

// Add new endpoint for submissions
app.post('/submit-code', async (req, res) => {
  const { userId, questionId, code, language, testCases, results } = req.body;
  
  try {
    // Calculate score based on passed test cases
    const totalTestCases = testCases.length;
    const passedTestCases = results.filter(r => r.passed).length;
    const scorePerTest = 10 / totalTestCases;
    const totalScore = passedTestCases * scorePerTest;
    
    // Create or update submission
    const submission = await UserSubmission.findOneAndUpdate(
      { userId, questionId },
      {
        code,
        language,
        score: totalScore,
        completed: passedTestCases === totalTestCases
      },
      { upsert: true, new: true }
    );

    res.json({ submission });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add endpoint to get user submissions
app.get('/user-submissions/:userId', async (req, res) => {
  try {
    const submissions = await UserSubmission.find({ userId: req.params.userId });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});



app.listen(5000, () => console.log('Server started on port 5000'));
