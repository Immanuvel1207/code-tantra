// QuestionDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CodeEditor from './CodeEditor';

function QuestionDetails() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  // Hardcoded user ID for demo - in real app, get from auth context
  const userId = "user123"; 

  useEffect(() => {
    axios.get(`http://localhost:5000/questions/${id}`)
      .then(response => setQuestion(response.data))
      .catch(error => console.error('Error fetching question:', error));
  }, [id]);

  if (!question) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">{question.name}</h1>
        <div className="bg-white p-4 rounded shadow">
          <div className="prose">
            <h2 className="text-xl font-semibold mb-2">Problem Description</h2>
            <p className="mb-4">{question.description}</p>
            
            <h3 className="font-semibold mb-2">Input Format</h3>
            <p className="mb-4">{question.inputFormat}</p>
            
            <h3 className="font-semibold mb-2">Output Format</h3>
            <p className="mb-4">{question.outputFormat}</p>
            
            <h3 className="font-semibold mb-2">Sample Input</h3>
            <pre className="bg-gray-100 p-2 rounded">{question.sampleInput}</pre>
            
            <h3 className="font-semibold mb-2">Sample Output</h3>
            <pre className="bg-gray-100 p-2 rounded">{question.sampleOutput}</pre>
          </div>
        </div>
      </div>

      <CodeEditor question={question} userId={userId} />
    </div>
  );
}

export default QuestionDetails;