// CodeEditor.js
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CodeEditor({ question, userId }) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [results, setResults] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();

  // Language configuration for Monaco Editor
  const languageOptions = {
    javascript: {
      id: 'javascript',
      extension: 'js',
      monacoLanguage: 'javascript',
      defaultCode: '// Write your JavaScript code here\n'
    },
    python: {
      id: 'python',
      extension: 'py',
      monacoLanguage: 'python',
      defaultCode: '# Write your Python code here\n'
    },
    cpp: {
      id: 'cpp',
      extension: 'cpp',
      monacoLanguage: 'cpp',
      defaultCode: '// Write your C++ code here\n'
    },
    java: {
      id: 'java',
      extension: 'java',
      monacoLanguage: 'java',
      defaultCode: '// Write your Java code here\n\nclass Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n'
    }
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(languageOptions[newLanguage].defaultCode);
  };

  // Monaco editor options
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    formatOnPaste: true,
    formatOnType: true,
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    tabSize: 4,
    detectIndentation: true,
    folding: true,
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    lineNumbers: 'on',
    renderWhitespace: 'selection',
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnCommitCharacter: true,
    quickSuggestions: true,
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const testCasesWithInput = question.testCases.map(testCase => ({
        ...testCase,
        input: testCase.input
      }));

      const response = await axios.post('http://localhost:5000/run-code', {
        code,
        language: languageOptions[language].id,
        testCases: testCasesWithInput,
      });

      setOutput(response.data.results[0].actualOutput);
      setResults(response.data.results);
    } catch (error) {
      console.error('Error running code:', error);
      setOutput('Error executing code: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!results) {
      alert('Please run your code first!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/submit-code', {
        userId,
        questionId: question._id,
        code,
        language: languageOptions[language].id,
        testCases: question.testCases,
        results
      });

      setIsSubmitted(true);
      alert(`Submission successful! Score: ${response.data.submission.score}/10`);
      navigate('/');
    } catch (error) {
      console.error('Error submitting code:', error);
      alert('Error submitting code: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Controls */}
      <div className="flex items-center gap-4 mb-4 p-4 bg-gray-100 rounded">
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>

        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className={`px-4 py-2 rounded text-white ${
            isRunning ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitted || isRunning}
          className={`px-4 py-2 rounded text-white ${
            isSubmitted || isRunning
              ? 'bg-green-400'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isSubmitted ? 'Submitted' : 'Submit'}
        </button>
      </div>

      {/* Code Editor */}
      <div className="flex-1 min-h-[500px] border rounded overflow-hidden" style={{marginLeft:'auto',marginRight:'auto',border:'2px solid black',height:'500px',width:'1300px',marginTop:'50px'}}>
        <Editor
          height="100%"
          width="100%"
          language={languageOptions[language].monacoLanguage}
          value={code}
          onChange={setCode}
          theme="white"
          options={editorOptions}
          defaultValue={languageOptions[language].defaultCode}
        />
      </div>

      {/* Output Panel */}
      {(output || results) && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          {output && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Output:</h3>
              <pre className="bg-white p-3 rounded shadow">{output}</pre>
            </div>
          )}

          {results && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded shadow ${
                      result.passed ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Test Case {index + 1}</span>
                      <span
                        className={`px-2 py-1 rounded ${
                          result.passed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {result.passed ? '✔️ Passed' : '✖️ Failed'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><strong>Input:</strong> {result.input}</p>
                      <p><strong>Expected:</strong> {result.expectedOutput}</p>
                      <p><strong>Got:</strong> {result.actualOutput}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CodeEditor;