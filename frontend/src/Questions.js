// Questions.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState({});
  // Hardcoded user ID for demo - in real app, get from auth context
  const userId = "user123";

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/questions'),
      axios.get(`http://localhost:5000/user-submissions/${userId}`)
    ])
      .then(([questionsRes, submissionsRes]) => {
        setQuestions(questionsRes.data);
        const submissionMap = {};
        submissionsRes.data.forEach(sub => {
          submissionMap[sub.questionId] = sub;
        });
        setSubmissions(submissionMap);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, [userId]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Coding Questions</h1>
      <div className="space-y-4">
        {questions.map(question => {
          const submission = submissions[question._id];
          return (
            <div
              key={question._id}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <Link
                  to={`/question/${question._id}`}
                  className="text-lg font-medium text-blue-600 hover:text-blue-800"
                >
                  {question.name}
                </Link>
                {submission && (
                  <div className="mt-1">
                    <span className="text-sm text-gray-600">
                      Score: {submission.score}/10
                    </span>
                    {submission.completed && (
                      <span className="ml-2 text-sm text-green-600">
                        ✅ Completed
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {question.points} points
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Questions;