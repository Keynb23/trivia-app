import React, { useState, useEffect, useCallback } from 'react';

function Quiz({ formData, questionData, setQuestionData, token }) {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

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

  const handleStartOver = () => {
    if (wrongCount >= 3) return;
    setSelectedAnswer('');
    setShowResults(false);
    setQuestionData(null);
    setError('');
    fetchQuestions();
  };

  const handleEndGame = () => {
    setWrongCount(0);
    setSelectedAnswer('');
    setShowResults(false);
    setQuestionData(null);
    setError('');
    fetchQuestions();
  };

  if (error) return (
    <div className="Error-Container">
      <p>{error}</p>
      <button onClick={() => { setError(''); fetchQuestions(); }}>Retry</button>
    </div>
  );

  if (loading || !questionData?.question) return <div className="Loading-Container">Loading...</div>;

  if (wrongCount >= 3) {
    return (
      <div className="GameOver-Container">
        <h2>{formData.firstName}, game over! You got 3 wrong answers.</h2>
        <button onClick={handleEndGame}>Play Again</button>
      </div>
    );
  }

  const answers = [...questionData.incorrect_answers, questionData.correct_answer].sort();

  return (
    <div className="Quiz-Container">
      {showResults ? (
        <div className="Results-Container">
          <h2>{formData.firstName}, you got it {selectedAnswer === questionData.correct_answer ? 'right!' : 'wrong.'}</h2>
          {selectedAnswer !== questionData.correct_answer && (
            <p>Correct answer: <span dangerouslySetInnerHTML={{ __html: questionData.correct_answer }} /></p>
          )}.
          <p>Wrong answers: {wrongCount}/3</p>
          <button onClick={handleStartOver}>Next Question</button>
        </div>

      ) : (
        <div className="Question-Container">
          <h2 dangerouslySetInnerHTML={{ __html: questionData.question }} />
          <div className="Answers-Container">
            {answers.map((answer, i) => (
              <div key={answer} className="Answer-Option">
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
          </div>
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
}

export default Quiz;