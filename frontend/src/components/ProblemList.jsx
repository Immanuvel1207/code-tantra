// src/components/ProblemList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/problems');
      const data = await response.json();
      setProblems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching problems:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-6">Coding Challenges</h1>
      <div className="grid gap-4">
        {problems.map((problem) => (
          <Link
            key={problem._id}
            to={`/problem/${problem._id}`}
            className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{problem.title}</h2>
            <div className="flex space-x-4 text-sm text-gray-500">
              <span>Difficulty: {problem.difficulty}</span>
              <span>Success Rate: {problem.successRate}%</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProblemList;