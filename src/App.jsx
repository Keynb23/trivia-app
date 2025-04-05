import { useState, useEffect } from 'react';
import Quiz from './Components/Quiz';
import Home from './Components/Home';
import './App.css';

function App() {
  const [formData, setFormData] = useState({ firstName: '', category: '', difficulty: '' });
  const [questionData, setQuestionData] = useState(null);
  const [token, setToken] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  // Fetches API token once on mount, sets it if successful
  useEffect(() => {
    if (!token) fetch('https://opentdb.com/api_token.php?command=request')
      .then(res => res.json())
      .then(data => data.response_code === 0 && setToken(data.token))
      .catch(err => console.error('Token error:', err));
  }, [token]);

  // Handles form submission from Home, updates state and shows Quiz
  const handleFormSubmit = data => {
    setFormData(data);
    setShowQuiz(true);
  };

  if (!token) return <div>Loading API token...</div>;
  return showQuiz ? (
    <Quiz formData={formData} questionData={questionData} setQuestionData={setQuestionData} token={token} />
  ) : (
    <Home formData={formData} setFormData={setFormData} onSubmit={handleFormSubmit} />
  );
}

export default App;