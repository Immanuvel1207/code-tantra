// scripts/seedQuestions.js
const mongoose = require('mongoose');
const Question = require('../models/Question');

const questions = [
  {
    name: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers in the array such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    inputFormat: "First line contains space-separated integers representing the array nums. Second line contains the target integer.",
    outputFormat: "Two space-separated integers representing the indices of the two numbers that add up to target.",
    sampleInput: "2 7 11 15\n9",
    sampleOutput: "0 1",
    testCases: [
      {
        input: "2 7 11 15\n9",
        expectedOutput: "0 1"
      },
      {
        input: "3 2 4\n6",
        expectedOutput: "1 2"
      },
      {
        input: "3 3\n6",
        expectedOutput: "0 1"
      }
    ]
  },
  {
    name: "Palindrome Number",
    description: "Given an integer x, return true if x is a palindrome, and false otherwise. An integer is a palindrome when it reads the same backward as forward.",
    inputFormat: "A single integer x",
    outputFormat: "true or false (boolean)",
    sampleInput: "121",
    sampleOutput: "true",
    testCases: [
      {
        input: "121",
        expectedOutput: "true"
      },
      {
        input: "-121",
        expectedOutput: "false"
      },
      {
        input: "10",
        expectedOutput: "false"
      }
    ]
  },
  {
    name: "Fibonacci Number",
    description: "The Fibonacci sequence is a series of numbers where each number is the sum of the previous two numbers. Write a function to calculate the nth Fibonacci number. (F(0) = 0, F(1) = 1)",
    inputFormat: "A single integer n (0 ≤ n ≤ 30)",
    outputFormat: "The nth Fibonacci number",
    sampleInput: "4",
    sampleOutput: "3",
    testCases: [
      {
        input: "4",
        expectedOutput: "3"
      },
      {
        input: "0",
        expectedOutput: "0"
      },
      {
        input: "1",
        expectedOutput: "1"
      },
      {
        input: "2",
        expectedOutput: "1"
      }
    ]
  },
  {
    name: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters.",
    inputFormat: "A string of characters separated by spaces",
    outputFormat: "The reversed string with characters separated by spaces",
    sampleInput: "h e l l o",
    sampleOutput: "o l l e h",
    testCases: [
      {
        input: "h e l l o",
        expectedOutput: "o l l e h"
      },
      {
        input: "H a n n a h",
        expectedOutput: "h a n n a H"
      }
    ]
  },
  {
    name: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: 1. Open brackets must be closed by the same type of brackets. 2. Open brackets must be closed in the correct order.",
    inputFormat: "A string containing only parentheses characters",
    outputFormat: "true or false (boolean)",
    sampleInput: "(){}[]",
    sampleOutput: "true",
    testCases: [
      {
        input: "(){}[]",
        expectedOutput: "true"
      },
      {
        input: "([)]",
        expectedOutput: "false"
      },
      {
        input: "{[]}",
        expectedOutput: "true"
      }
    ]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/leetcode_clone', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Clear existing questions
    await Question.deleteMany({});

    // Insert new questions
    const insertedQuestions = await Question.insertMany(questions);
    
    console.log(`Successfully inserted ${insertedQuestions.length} questions`);
    console.log('Sample question IDs:');
    insertedQuestions.forEach(q => console.log(`${q.name}: ${q._id}`));

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the seeding function
seedDatabase();