// src/components/ProblemDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';

const ProblemDetails = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/problems/${id}`);
      const data = await response.json();
      setProblem(data);
      setCode(data.starterCode);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching problem:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:3001/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemId: id,
          code,
        }),
      });
      const data = await response.json();
      setOutput(data.output);
    } catch (error) {
      console.error('Error submitting code:', error);
      setOutput('Error submitting code');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-[calc(100vh-8rem)]">
      <div className="bg-white p-6 rounded-lg shadow overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: problem.description }} />
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Example Input:</h3>
          <pre className="bg-gray-100 p-2 rounded">{problem.exampleInput}</pre>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Example Output:</h3>
          <pre className="bg-gray-100 p-2 rounded">{problem.exampleOutput}</pre>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="h-2/3 bg-white rounded-lg shadow">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            onChange={setCode}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>
        
        <div className="h-1/3 bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold">Output</h3>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {submitting ? 'Running...' : 'Run Code'}
            </button>
          </div>
          <pre className="bg-gray-100 p-2 rounded h-[calc(100%-3rem)] overflow-y-auto">
            {output || 'Output will appear here...'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetails;