// models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  inputFormat: { type: String, required: true },
  outputFormat: { type: String, required: true },
  sampleInput: { type: String, required: true },
  sampleOutput: { type: String, required: true },
  testCases: [
    {
      input: String,
      expectedOutput: String,
    },
  ],
});

module.exports = mongoose.model('Question', questionSchema);
