import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Questions() {
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/questions')
            .then(response => setQuestions(response.data))
            .catch(error => console.error('Error fetching questions:', error));
    }, []);

    return (
        <div>
            <h1>Questions</h1>
            <ul>
                {questions.map(question => (
                    <li key={question._id}>
                        {/* Ensure the `question._id` is passed correctly here */}
                        <Link to={`/question/${question._id}`}>{question.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Questions;
