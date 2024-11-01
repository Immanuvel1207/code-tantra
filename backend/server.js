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
const User = require('./models/User'); // Adjust the path if necessary

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

// Run code endpoint
app.post('/run-code', async (req, res) => {
    const { code, language, testCases } = req.body;
    const languageMap = {
        javascript: 63,
        python: 71,
        cpp: 54,
        java: 62,
    };

    const languageId = languageMap[language];
    const results = [];

    try {
        for (const testCase of testCases) {
            const { input, expectedOutput } = testCase;

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

            const getResult = async () => {
                const { data: result } = await axios.get(`${JUDGE0_URL}/${submissionId}`, {
                    headers: {
                        'X-RapidAPI-Key': JUDGE0_API_KEY,
                        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                    },
                });
                return result;
            };

            let result = await getResult();
            while (result.status.id <= 2) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                result = await getResult();
            }

            const actualOutput = (result.stdout || '').trim(); // Trimming output
            const passed = actualOutput === expectedOutput.trim(); // Also trim expectedOutput

            results.push({
                input,
                expectedOutput,
                actualOutput,
                passed,
            });
        }

        const passedCount = results.filter(result => result.passed).length;
        res.json({
            totalTestCases: testCases.length,
            passedTestCases: passedCount,
            results,
        });
    } catch (error) {
        console.error('Error executing code:', error.response ? error.response.data : error.message);
        res.status(500).json({
            message: 'Error executing code',
            error: error.response ? error.response.data : error.message,
        });
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
    const userId = mongoose.Types.ObjectId.isValid(req.params.userId)
      ? req.params.userId
      : null;

    const submissions = await UserSubmission.find(userId ? { userId } : { userName: req.params.userId });
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

  
  



// Example of a login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      res.json(user);
    } else {
      res.status(400).json({ error: 'Invalid credentials' });
    }
  });
  
  // Example of a register route
  app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
      const newUser = new User({ username, email, password });
      await newUser.save();
      res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });
  



app.listen(5000, () => console.log('Server started on port 5000'));
