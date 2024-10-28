// QuestionDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CodeEditor from './CodeEditor';

function QuestionDetails() {
    const { id } = useParams();
    const [question, setQuestion] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/questions/${id}`)
            .then(response => setQuestion(response.data))
            .catch(error => console.error('Error fetching question details:', error));
    }, [id]);

    return (
        <div>
            {question ? (
                <div>
                    <h2>{question.name}</h2>
                    <p>{question.description}</p>
                    <p><strong>Input Format:</strong> {question.inputFormat}</p>
                    <p><strong>Output Format:</strong> {question.outputFormat}</p>
                    <CodeEditor testCases={question.testCases} />
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default QuestionDetails;
