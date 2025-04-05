import React, { useState, useEffect, useCallback } from 'react';

function Quiz({ formData, questionData, setQuestionData, token }) {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);


  // Fetches a new question from API, enforces 10s delay to avoid rate limits
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const now = Date.now();
      const minDelay = 10000;
      if (now - lastRequestTime < minDelay) await new Promise(r => setTimeout(r, minDelay - (now - lastRequestTime)));
      const url = `https://opentdb.com/api.php?amount=1&category=${formData.category}&difficulty=${formData.difficulty}&type=multiple&token=${token}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status === 429 ? 'Too many requests, please wait...' : `HTTP error: ${res.status}`);
      const data = await res.json();
      if (data.response_code === 0 && data.results?.length) {
        setQuestionData(data.results[0]);
        setLastRequestTime(now);
        setError('');
      } else setError(`No questions: ${data.response_code}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [formData, setQuestionData, token, lastRequestTime]);

  useEffect(() => {
    if (!questionData && !loading) fetchQuestions();
  }, [fetchQuestions, questionData, loading]);

  // Step 2: Updated to track wrong answers
  const handleSubmit = () => {
    if (!selectedAnswer) {
      setError('Select an answer!');
      return;
    }
    if (selectedAnswer !== questionData.correct_answer) {
      setWrongCount(prev => prev + 1);
    }
    setShowResults(true);
  };

// Step 3: Updated to check game over
const handleStartOver = () => {
  if (wrongCount >= 3) return;
  setSelectedAnswer('');
  setShowResults(false);
  setQuestionData(null);
  setError('');
  fetchQuestions();
};

// Step 4: Added to reset game
const handleEndGame = () => {
  setWrongCount(0);
  setSelectedAnswer('');
  setShowResults(false);
  setQuestionData(null);
  setError('');
  fetchQuestions();
};

if (error) return <div>{error} <button onClick={() => { setError(''); fetchQuestions(); }}>Retry</button></div>;
if (loading || !questionData?.question) return <div>Loading...</div>;

// Step 5: Added game over condition
if (wrongCount >= 3) {
  return (
    <div>
      <h2>{formData.firstName}, game over! You got 3 wrong answers.</h2>
      <button onClick={handleEndGame}>Play Again</button>
    </div>
  );
}

const answers = [...questionData.incorrect_answers, questionData.correct_answer].sort();

return (
  <div>
    {showResults ? (
      <>
        <h2>{formData.firstName}, you got it {selectedAnswer === questionData.correct_answer ? 'right!' : 'wrong.'}</h2>
        {selectedAnswer !== questionData.correct_answer && <p>Correct answer: <span dangerouslySetInnerHTML={{ __html: questionData.correct_answer }} /></p>}
        <p>Wrong answers: {wrongCount}/3</p> {/* Step 5: Added wrong count display */}
        <button onClick={handleStartOver}>Next Question</button>
      </>
    ) : (
      <>
        <h2 dangerouslySetInnerHTML={{ __html: questionData.question }} />
        {answers.map((answer, i) => (
          <div key={answer}>
            <input
              type="radio"
              id={`answer-${i}`}
              name="answer"
              value={answer}
              onChange={e => setSelectedAnswer(e.target.value)}
            />
            <label htmlFor={`answer-${i}`} dangerouslySetInnerHTML={{ __html: answer }} />
          </div>
        ))}
        <button onClick={handleSubmit}>Submit</button>
      </>
    )}
  </div>
);
}

export default Quiz;