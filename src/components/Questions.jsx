import React, { useEffect, useId, useState } from 'react';
import { useNavigate, useParams, NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Spinner from './Loading';
import '../styles/Questions.css';

function QuestionsAndOptions({ authToken, adminId, admin, quizTitle }) {
    const { quizId, hasEnded } = useParams();
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    console.log(quizTitle)
    // Questions state
    const [questions, setQuestions] = useState([]);
    const [deleteQuestion, setDeleteQuestion] = useState('');
    const [deleteQuestionId, setDeleteQuestionId] = useState(null);
    const [questionText, setQuestionText] = useState('');
    const [questionDifficulty, setQuestionDifficulty] = useState('');
    const [questionPoints, setQuestionPoints] = useState('');
    const [difficultyInputId] = useState(useId());
    const [pointsInputId] = useState(useId());

    // Options state
    const [expandedQuestionId, setExpandedQuestionId] = useState(null);
    const [options, setOptions] = useState({}); // Store options by questionId
    const [optionText, setOptionText] = useState('');
    const [optionsIsCorrect, setOptionIsCorrect] = useState(false);
    const [deleteOptionId, setDeleteOptionId] = useState(null);
    const [deleteOption, setDeleteOption] = useState('');
    const [currentQuestionForOption, setCurrentQuestionForOption] = useState(null);

    const navigate = useNavigate();

    const disableButton = () => {
        const decodedToken = jwtDecode(authToken);
        setIsAdmin(adminId === decodedToken.sub);
    };

    // Questions functions
    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://localhost:7110/api/question/${quizId}/getAllQuestions`, {
                method: "GET",
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.ok) {
                const data = await response.json();
                setQuestions(data?.$values || []);

                // Initialize options state for each question
                const optionsState = {};
                data?.$values?.forEach(question => {
                    optionsState[question.questionId] = [];
                });
                setOptions(optionsState);
            }
        } catch (error) {
            console.error("Something went wrong...", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuestion = async () => {
        try {
            setLoading(true);
            const form = new FormData();
            form.append('text', questionText);
            form.append('difficulty', questionDifficulty);
            form.append('points', questionPoints);

            const response = await fetch(`https://localhost:7110/api/question/${quizId}/AddQuestion`, {
                method: "POST",
                headers: { Authorization: `Bearer ${authToken}` },
                body: form,
            });

            if (response.ok) {
                const data = await response.json();
                setQuestions((prev) => [...prev, data]);
                // Initialize options array for the new question
                setOptions(prev => ({
                    ...prev,
                    [data.questionId]: []
                }));
                const modal = document.getElementById('newQuestionModal');
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide();
            } else {
                console.error("An error occurred while adding the question:", response.statusText);
            }
        } catch (error) {
            console.error("Something went wrong...", error);
        } finally {
            setLoading(false);
            setQuestionText('');
            setQuestionDifficulty('');
            setQuestionPoints('');
        }
    };

    const handleDeleteQuestion = async (deleteQuestionId) => {
        try {
            setLoading(true);
            const response = await fetch(`https://localhost:7110/api/question/${deleteQuestionId}/DeleteQuestion`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.ok) {
                fetchQuestions();
            } else {
                console.error("An error occurred while deleting the question:", response.statusText);
            }
        } catch (error) {
            console.error("Something went wrong...", error);
        } finally {
            setLoading(false);
        }
    };

    // Options functions
    const fetchOptions = async (questionId) => {
        try {
            setLoading(true);
            const response = await fetch(`https://localhost:7110/api/option/${questionId}/getAllOptions`, {
                method: "GET",
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.ok) {
                const data = await response.json();
                setOptions(prev => ({
                    ...prev,
                    [questionId]: data?.$values || []
                }));
            } else {
                console.error("An error occurred while fetching the options: ", response.statusText);
            }
        } catch (error) {
            console.error("Something went wrong...", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOption = async () => {
        try {
            setLoading(true);

            const form = new FormData();
            form.append('text', optionText);
            form.append('isCorrect', optionsIsCorrect);

            const response = await fetch(`https://localhost:7110/api/option/${currentQuestionForOption}/addOption`, {
                method: "POST",
                headers: { Authorization: `Bearer ${authToken}` },
                body: form,
            });

            if (response.ok) {
                const data = await response.json();
                setOptions(prev => ({
                    ...prev,
                    [currentQuestionForOption]: [...prev[currentQuestionForOption], data]
                }));
                const modal = document.getElementById('newOptionModal');
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide();
            } else {
                console.error("An error occurred while adding the option: ", response.statusText);
            }
        } catch (error) {
            console.error("Something went wrong...", error);
        } finally {
            setLoading(false);
            setOptionText('');
            setOptionIsCorrect(false);
        }
    };

    const handleDeleteOption = async (deleteOptionId) => {
        try {
            setLoading(true);

            const response = await fetch(`https://localhost:7110/api/option/${deleteOptionId}/deleteOption`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.ok) {
                fetchOptions(currentQuestionForOption);
            } else {
                console.error("An error occurred while deleting the option: ", response.statusText);
            }
        } catch (error) {
            console.error("Something went wrong...", error);
        } finally {
            setLoading(false);
            setDeleteOption('');
            setDeleteOptionId(null);
        }
    };

    const toggleQuestionOptions = (questionId) => {
        if (expandedQuestionId === questionId) {
            setExpandedQuestionId(null);
        } else {
            setExpandedQuestionId(questionId);
            if (!options[questionId] || options[questionId].length === 0) {
                fetchOptions(questionId);
            }
            setCurrentQuestionForOption(questionId);
        }
    };

    // Check if a question has exactly 4 options with one correct
    const isQuestionComplete = (questionId) => {
        const questionOptions = options[questionId] || [];
        return questionOptions.length === 4 && questionOptions.some(opt => opt.isCorrect);
    };

    // Check if all questions are complete
    const canAddNewQuestion = questions.every(question => isQuestionComplete(question.questionId));

    useEffect(() => {
        fetchQuestions();
        disableButton();
    }, []);

    return (
        <div className="classroom-container">
            <div className="questions-container">
                <NavLink to="/courseDetails" className="back-link" onClick={() => (localStorage.removeItem('QuizTitle'))}>◄ Back</NavLink>
                <h2 className="quiz-title">Questions for: {localStorage.getItem("QuizTitle")}</h2>
                {isAdmin && (
                    <button
                        className="btn new-question-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#newQuestionModal"
                        disabled={!canAddNewQuestion && questions.length > 0}
                        title={!canAddNewQuestion && questions.length > 0 ? "Complete all existing questions before adding new ones" : ""}
                    >
                        New Question
                    </button>
                )}
                {loading ? (
                    <div className="loading-container">
                        <Spinner />
                    </div>
                ) : (
                    <div>
                        <ul className="questions-list">
                            {questions.length > 0 ? (
                                questions.map((question) => (
                                    <li key={question.questionId} className="question-item">
                                        <div
                                            className="question-header"
                                            onClick={() => toggleQuestionOptions(question.questionId)}
                                        >
                                            <p className="question-text">{question.text}</p>
                                            <p className="question-details">Difficulty: {question.difficulty} | Points: {question.points}</p>
                                            <span className="question-status">
                                                {isQuestionComplete(question.questionId) ?
                                                    "✓ Complete" :
                                                    `✗ Needs ${4 - (options[question.questionId]?.length || 0)} more options`}
                                            </span>
                                            {isAdmin && (
                                                <button
                                                    className="btn btn-outline-danger btn-sm delete-btn"
                                                    disabled={!hasEnded}
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#deleteQuestionModal"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteQuestion(question.text);
                                                        setDeleteQuestionId(question.questionId);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>

                                        {expandedQuestionId === question.questionId && (
                                            <div className="options-container">
                                                <ul className="options-list">
                                                    {options[question.questionId]?.length > 0 ? (
                                                        options[question.questionId].map((option) => (
                                                            <li
                                                                key={option.optionId}
                                                                className={`option-item ${option.isCorrect ? 'correct-option' : ''}`}
                                                            >
                                                                <span className="option-text">{option.text}</span>
                                                                <span className="option-correct">
                                                                    {option.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                                                                </span>
                                                                {isAdmin && (
                                                                    <button
                                                                        className="btn btn-outline-danger btn-sm delete-option-btn"
                                                                        disabled={!hasEnded}
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#deleteOptionModal"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setDeleteOption(option.text);
                                                                            setDeleteOptionId(option.optionId);
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="no-options">No options yet</li>
                                                    )}
                                                </ul>

                                                {isAdmin && (
                                                    <button
                                                        className="btn btn-sm add-option-btn"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#newOptionModal"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrentQuestionForOption(question.questionId);
                                                        }}
                                                        disabled={options[question.questionId]?.length >= 4}
                                                    >
                                                        Add Option
                                                    </button>
                                                )}

                                                <div className="options-count">
                                                    {options[question.questionId]?.length || 0}/4 options
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))
                            ) : (
                                <div className="no-content">No questions!</div>
                            )}
                        </ul>
                    </div>
                )}

                {/* New Question Modal */}
                <div className="modal fade" id="newQuestionModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">New Question</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    placeholder="Enter the question here"
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    value={questionText}
                                />
                                <input
                                    type="number"
                                    className="form-control mb-3"
                                    placeholder="Enter difficulty"
                                    id={difficultyInputId}
                                    onChange={(e) => setQuestionDifficulty(e.target.value)}
                                    value={questionDifficulty}
                                />
                                <input
                                    type="number"
                                    className="form-control mb-3"
                                    placeholder="Enter points"
                                    id={pointsInputId}
                                    onChange={(e) => setQuestionPoints(e.target.value)}
                                    value={questionPoints}
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => (setQuestionText(''), setQuestionDifficulty(''), setQuestionPoints(''))} data-bs-dismiss="modal">Cancel</button>
                                <button className="btn btn-primary" onClick={handleCreateQuestion}>
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Question Modal */}
                <div className="modal fade" id="deleteQuestionModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Delete Question</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                Are you sure you want to delete the question: <b>{deleteQuestion}</b>?
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button className="btn btn-danger" disabled={!hasEnded} onClick={() => handleDeleteQuestion(deleteQuestionId)} data-bs-dismiss="modal">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* New Option Modal */}
                <div className="modal fade" id="newOptionModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">New Option</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    placeholder="Enter the option text"
                                    onChange={(e) => setOptionText(e.target.value)}
                                    value={optionText}
                                />
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="flexSwitchCheckDefault"
                                        checked={optionsIsCorrect}
                                        onChange={() => setOptionIsCorrect(!optionsIsCorrect)}
                                    />
                                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">
                                        {optionsIsCorrect ? 'Correct' : 'Incorrect'}
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleCreateOption}
                                    disabled={options[currentQuestionForOption]?.length >= 4}
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Option Modal */}
                <div className="modal fade" id="deleteOptionModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Delete Option</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                Are you sure you want to delete the option: <b>{deleteOption}</b>?
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDeleteOption(deleteOptionId)}
                                    data-bs-dismiss="modal"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuestionsAndOptions;