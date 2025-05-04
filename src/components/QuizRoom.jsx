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
    const [progress, setProgress] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleAnswerChange = useCallback((questionId, optionId) => {
        setSelectedAnswers(prev => {
            const newAnswers = { ...prev, [questionId]: optionId };
            // Update answered questions set
            const newAnswered = new Set(answeredQuestions);
            newAnswered.add(questionId);
            setAnsweredQuestions(newAnswered);
            // Update progress
            setProgress(Math.round((newAnswered.size / questionsWithOptions.length) * 100));
            return newAnswers;
        });
    }, [answeredQuestions, questionsWithOptions.length]);

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
            navigate('/courseDetails');
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

    const jumpToQuestion = (index) => {
        setCurrentQuestionIndex(index);
    };

    const toggleConfirmation = () => {
        setShowConfirmation(!showConfirmation);
    };

    return (
        <div className="quiz-room-container">
            <div className="quiz-header">
                <NavLink to="/quiz" className="back-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to Quizzes
                </NavLink>
                <div className="quiz-title-container">
                    <h2 className="quiz-title">{quizTitle}</h2>
                    <div className="quiz-meta">
                        <span className="question-counter">
                            Question {currentQuestionIndex + 1} of {questionsWithOptions.length}
                        </span>
                        <CountdownTimer initialMinutes={duration} onTimeUp={handleSubmit} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <Spinner />
                </div>
            ) : (
                <div className="quiz-content">
                    {questionsWithOptions.length > 0 ? (
                        <>
                            <div className="progress-container">
                                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                <span className="progress-text">{progress}% Complete</span>
                            </div>

                            <div className="question-navigation">
                                {questionsWithOptions.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`question-nav-btn ${currentQuestionIndex === index ? 'active' : ''} ${answeredQuestions.has(questionsWithOptions[index].questionId) ? 'answered' : ''}`}
                                        onClick={() => jumpToQuestion(index)}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>

                            <div className="question-card">
                                <div className="question-header">
                                    <div className="difficulty-badge" data-difficulty={questionsWithOptions[currentQuestionIndex].difficulty}>
                                        {questionsWithOptions[currentQuestionIndex].difficulty}
                                    </div>
                                    <div className="points-badge">
                                        {questionsWithOptions[currentQuestionIndex].points} pts
                                    </div>
                                </div>
                                <h3 className="question-text">{questionsWithOptions[currentQuestionIndex].text}</h3>

                                <div className="options-container">
                                    {questionsWithOptions[currentQuestionIndex].options?.$values?.map((option) => (
                                        <div
                                            key={option.optionId}
                                            className={`option-item ${selectedAnswers[questionsWithOptions[currentQuestionIndex].questionId] === option.optionId ? 'selected' : ''}`}
                                            onClick={() => handleAnswerChange(questionsWithOptions[currentQuestionIndex].questionId, option.optionId)}
                                        >
                                            <div className="option-radio">
                                                <div className="radio-circle"></div>
                                            </div>
                                            <div className="option-text">{option.text}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-questions-card">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 8V12" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 16H12.01" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <h3>No Questions Available</h3>
                            <p>There are no questions in this quiz. Please contact your instructor.</p>
                        </div>
                    )}

                    <div className="quiz-footer">
                        <div className="navigation-buttons">
                            <button
                                onClick={goToPreviousQuestion}
                                disabled={currentQuestionIndex === 0}
                                className="nav-button prev-button"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Previous
                            </button>
                            <button
                                onClick={goToNextQuestion}
                                disabled={currentQuestionIndex === questionsWithOptions.length - 1}
                                className="nav-button next-button"
                            >
                                Next
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        <button
                            onClick={toggleConfirmation}
                            disabled={isSubmitting}
                            className="submit-button"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 22V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Submitting...
                                </>
                            ) : 'Submit Quiz'}
                        </button>
                    </div>
                </div>
            )}

            {showConfirmation && (
                <div className="confirmation-modal">
                    <div className="confirmation-content">
                        <h3>Submit Quiz?</h3>
                        <p>Are you sure you want to submit your answers? You won't be able to make changes after submission.</p>
                        <div className="confirmation-buttons">
                            <button onClick={toggleConfirmation} className="cancel-button">Cancel</button>
                            <button onClick={handleSubmit} className="confirm-button">Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QuizRoom;