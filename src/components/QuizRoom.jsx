import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from './Loading';
import { NavLink } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';
import '../styles/QuizRoom.css';

function QuizRoom({ authToken, quizTitle }) {
    const [loading, setLoading] = useState(false);
    const { quizId, duration } = useParams();
    const [questionsWithOptions, setQuestionsWithOptions] = useState([]);
    const navigate = useNavigate();
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAnswerChange = useCallback((questionId, optionId) => {
        setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
    }, []);

    const fetchQuestionsWithOptions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://localhost:7110/api/question/${quizId}/getallquestionswithoptions`, {
                method: "GET",
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.ok) {
                const data = await response.json();
                setQuestionsWithOptions(data?.$values || []);
            } else {
                console.error("An error occurred while fetching questions:", response.statusText);
            }
        } catch (error) {
            console.error("Something went wrong...", error);
        } finally {
            setLoading(false);
        }
    }, [quizId, authToken]);

    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true);
        const answers = Object.keys(selectedAnswers).map(questionId => ({
            questionId,
            optionId: selectedAnswers[questionId],
        }));

        try {
            const response = await fetch(`https://localhost:7110/api/quizresponse/${quizId}/SubmitQuiz`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answers }),
            });

            if (response.ok) {
                alert("Answers submitted successfully!");
            } else {
                console.error("An error occurred while submitting the quiz:", response.statusText);
            }
        } catch (error) {
            console.error("An error occurred while submitting the answers:", error);
        } finally {
            setIsSubmitting(false);
            navigate('/quiz');
        }
    }, [quizId, authToken, selectedAnswers, navigate]);

    useEffect(() => {
        fetchQuestionsWithOptions();
    }, [fetchQuestionsWithOptions]);

    const goToNextQuestion = useCallback(() => {
        if (currentQuestionIndex < questionsWithOptions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }
    }, [currentQuestionIndex, questionsWithOptions.length]);

    const goToPreviousQuestion = useCallback(() => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prevIndex => prevIndex - 1);
        }
    }, [currentQuestionIndex]);

    return (
        <div className="quiz-room-container">
            <NavLink to="/quiz" className="back-link">◄ Back</NavLink>
            <h3 className="quiz-title">{quizTitle}</h3>
            {loading ? (
                <div className="loading-container">
                    <Spinner />
                </div>
            ) : (
                <div className="quiz-content">
                    <CountdownTimer initialMinutes={duration} />
                    <div className="question-navigation">
                        <button onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>Previous</button>
                        <span>{currentQuestionIndex + 1} / {questionsWithOptions.length}</span>
                        <button onClick={goToNextQuestion} disabled={currentQuestionIndex === questionsWithOptions.length - 1}>Next</button>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="quiz-form">
                        {questionsWithOptions.length > 0 ? (
                            <div className="question-container">
                                <h4 className="question-text">{questionsWithOptions[currentQuestionIndex].text}</h4>
                                <p className="question-meta">
                                    Difficulty: {questionsWithOptions[currentQuestionIndex].difficulty} | 
                                    Points: {questionsWithOptions[currentQuestionIndex].points}
                                </p>
                                {questionsWithOptions[currentQuestionIndex].options?.$values?.map((option) => (
                                    <div key={option.optionId} className="option-container">
                                        <label className="option-label">
                                            <input
                                                type="radio"
                                                name={`question-${questionsWithOptions[currentQuestionIndex].questionId}`}
                                                value={option.optionId}
                                                checked={selectedAnswers[questionsWithOptions[currentQuestionIndex].questionId] === option.optionId}
                                                onChange={() => handleAnswerChange(questionsWithOptions[currentQuestionIndex].questionId, option.optionId)}
                                            />
                                            <span className="option-text">{option.text}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-questions-message">There are no questions, please contact your instructor</p>
                        )}
                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default QuizRoom;

