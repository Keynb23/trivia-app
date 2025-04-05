import React, { useState } from 'react';

function Home({ formData, setFormData, onSubmit }) {
  const [error, setError] = useState('');
  const categories = [
    { id: 9, name: 'General Knowledge' },
    { id: 17, name: 'Science & Nature' },
    { id: 23, name: 'History' },
    { id: 21, name: 'Sports' },
  ];
  const difficulties = ['easy', 'medium', 'hard'];

  // Validates form and submits data if all fields are filled
  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.firstName || !formData.category || !formData.difficulty) {
      setError('All fields are required!');
      return;
    }
    setError('');
    onSubmit(formData);
  };

  return (
    <div>
      <h1>Welcome to the Trivia Quiz!</h1>
      <p>Enter your name, select a category and difficulty, then submit to start!</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="">Select a category</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="difficulty">Difficulty:</label>
          <select
            id="difficulty"
            value={formData.difficulty}
            onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
          >
            <option value="">Select difficulty</option>
            {difficulties.map(diff => <option key={diff} value={diff}>{diff}</option>)}
          </select>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Start Quiz</button>
      </form>
    </div>
  );
}

export default Home;