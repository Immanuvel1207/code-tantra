// scripts/insertQuestion.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codingplatform');

// Problem Schema
const problemSchema = new mongoose.Schema({
  title: String,
  difficulty: String,
  description: String,
  starterCode: String,
  testCases: [{
    input: String,
    output: String,
    isHidden: Boolean
  }],
  exampleInput: String,
  exampleOutput: String,
  successRate: Number,
  timeLimit: Number,
  memoryLimit: Number
});

const Problem = mongoose.model('Problem', problemSchema);

// Sample question to insert
const sampleQuestion = {
  title: "Two Sum",
  difficulty: "Easy",
  description: `<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers in the array such that they add up to <code>target</code>.</p>
                <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
                <p>You can return the answer in any order.</p>`,
  starterCode: `function twoSum(nums, target) {
    // Write your code here
}`,
  testCases: [
    {
      input: '[2,7,11,15]\n9',
      output: '[0,1]',
      isHidden: false
    },
    {
      input: '[3,2,4]\n6',
      output: '[1,2]',
      isHidden: false
    },
    {
      input: '[3,3]\n6',
      output: '[0,1]',
      isHidden: false
    },
    {
      input: '[1,2,3,4,5]\n9',
      output: '[3,4]',
      isHidden: true
    }
  ],
  exampleInput: '[2,7,11,15]\n9',
  exampleOutput: '[0,1]',
  successRate: 85,
  timeLimit: 2000,
  memoryLimit: 256
};

// Function to insert the question
async function insertQuestion() {
  try {
    const problem = new Problem(sampleQuestion);
    await problem.save();
    console.log('Question inserted successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error inserting question:', error);
    mongoose.connection.close();
  }
}

insertQuestion();

// API Routes (add to your Express server)
const express = require('express');
const router = express.Router();

// Get all problems
router.get('/api/problems', async (req, res) => {
  try {
    const problems = await Problem.find({}, 'title difficulty successRate');
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching problems' });
  }
});

// Get specific problem
router.get('/api/problems/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching problem' });
  }
});

// Submit solution
router.post('/api/submit', async (req, res) => {
  try {
    const { problemId, code } = req.body;
    const problem = await Problem.findById(problemId);
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Run tests (simplified version - in production you'd want to use a sandboxed environment)
    const testResults = [];
    let allTestsPassed = true;

    for (const testCase of problem.testCases) {
      try {
        const sandbox = { input: JSON.parse(testCase.input), target: parseInt(testCase.input.split('\n')[1]) };
        const userFunction = new Function('nums', 'target', code);
        const result = JSON.stringify(userFunction(sandbox.input, sandbox.target));
        
        const passed = result === testCase.output;
        testResults.push({
          passed,
          input: testCase.isHidden ? 'Hidden' : testCase.input,
          expected: testCase.isHidden ? 'Hidden' : testCase.output,
          actual: testCase.isHidden ? 'Hidden' : result
        });
        
        if (!passed) allTestsPassed = false;
      } catch (error) {
        testResults.push({
          passed: false,
          input: testCase.isHidden ? 'Hidden' : testCase.input,
          error: error.message
        });
        allTestsPassed = false;
      }
    }

    res.json({
      success: allTestsPassed,
      output: testResults.map(result => 
        `Test Case ${testResults.indexOf(result) + 1}: ${result.passed ? 'PASSED' : 'FAILED'}
         ${result.input !== 'Hidden' ? `Input: ${result.input}` : 'Input: Hidden'}
         ${result.expected ? `Expected: ${result.expected}` : ''}
         ${result.actual ? `Actual: ${result.actual}` : ''}
         ${result.error ? `Error: ${result.error}` : ''}`
      ).join('\n\n')
    });
  } catch (error) {
    res.status(500).json({ error: 'Error processing submission' });
  }
});

module.exports = router;