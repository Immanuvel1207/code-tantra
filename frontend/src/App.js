// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Questions from './Questions';
import QuestionDetails from './QuestionDetails';
import Login from './Login';
import Register from './Register';

function App() {
  const [user, setUser] = useState(null);

  // Simulate checking if user is logged in (use local storage or an API for real projects)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={user ? <Questions /> : <Navigate to="/login" />}
        />
        <Route
          path="/question/:id"
          element={user ? <QuestionDetails /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
