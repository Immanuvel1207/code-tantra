// CodeEditor.js
import React, { useState } from 'react';
import axios from 'axios';

function CodeEditor({ testCases }) {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [results, setResults] = useState(null);

    const handleRunCode = async () => {
        try {
            const response = await axios.post('http://localhost:5000/run-code', {
                code,
                language,
                testCases,
            });
            setResults(response.data);
        } catch (error) {
            console.error('Error running code:', error);
            setResults({ error: 'Error: Unable to run code' });
        }
    };

    return (
        <div>
            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your code here..."
                rows="10"
                cols="50"
            ></textarea>

            <div>
                <label htmlFor="language">Select Language: </label>
                <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                </select>
            </div>

            <button onClick={handleRunCode}>Run Code</button>

            {results && (
                <div>
                    <h3>Test Results</h3>
                    <p>
                        Passed {results.passedTestCases} out of {results.totalTestCases} test cases
                    </p>
                    <ul>
                        {results.results.map((result, index) => (
                            <li key={index}>
                                <strong>Test Case {index + 1}:</strong>
                                <br />
                                <strong>Input:</strong> {result.input}
                                <br />
                                <strong>Expected Output:</strong> {result.expectedOutput}
                                <br />
                                <strong>Actual Output:</strong> {result.actualOutput}
                                <br />
                                <strong>Status:</strong>{' '}
                                {result.passed ? (
                                    <span style={{ color: 'green' }}>Passed</span>
                                ) : (
                                    <span style={{ color: 'red' }}>Failed</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default CodeEditor;
