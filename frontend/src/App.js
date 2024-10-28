import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Questions from './Questions';
import QuestionDetails from './QuestionDetails';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Questions />} />
                <Route path="/question/:id" element={<QuestionDetails />} />
            </Routes>
        </Router>
    );
}

export default App;
