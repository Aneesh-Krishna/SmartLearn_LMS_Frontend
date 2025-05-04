import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Spinner from './Loading';
import { useNavigate } from 'react-router-dom';
import DateTimeComponent from './DateTimeComponent';
import '../styles/Quiz.css';
import DateTimePicker from './DateTimePicker';

function Quiz({ authToken, adminId, courseId, courseName, setQuizId, quizTitle, setQuizTitle }) {
    const [quizzes, setQuizzes] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deleteQuizId, setDeleteQuizId] = useState(null);
    const [deleteQuizName, setDeleteQuizName] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [duration, setDuration] = useState('');
    const navigate = useNavigate();

    const isTimeValid = (selectedDate) => {
        const now = new Date();
        const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000); // Current time + 3 hours

        return selectedDate <= threeHoursLater;
    };

    const disableButton = () => {
        const decodedToken = jwtDecode(authToken);
        setIsAdmin(adminId === decodedToken.sub);
    };

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://localhost:7110/api/quiz/${courseId}/getallquiz`, {
                method: "GET",
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.ok) {
                const data = await response.json();
                setQuizzes(data?.$values || []);
            } else {
                console.error(response.statusText);
            }
        } catch (error) {
            console.error("Something went wrong...", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuiz = async () => {
        if (!quizTitle || !scheduledTime || !duration) {
            alert("Please fill in all fields.");
            return;
        }

        if (isTimeValid(scheduledTime)) {
            document.getElementById('closeUpdateModal').click();
            alert("Selected time must be within 3 hours from now");
            return;
        }

        try {
            setLoading(true);
            const form = new FormData();
            form.append('quizTitle', quizTitle);
            form.append('scheduledTime', scheduledTime);
            form.append('duration', duration);

            const response = await fetch(`https://localhost:7110/api/quiz/${courseId}/createQuiz`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: form,
            });

            if (response.ok) {
                const data = await response.json();
                setQuizzes((prev) => [...prev, data]);
                fetchQuizzes();

                const modal = document.getElementById('newQuizModal');
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide();

                setQuizTitle('');
                setScheduledTime('');
                setDuration('');
            }
            else {
                console.error("An error occurred while creating the quiz:", response.statusText);
            }
        }
        catch (error) {
            console.error("Something went wrong...", error);
        }
        finally {
            setLoading(false);
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        try {
            setLoading(true);
            const response = await fetch(`https://localhost:7110/api/quiz/${quizId}/DeleteQuiz`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.ok) {
                fetchQuizzes();
            }
            else {
                console.error("An error occurred while deleting the quiz:", response.statusText);
            }
        }
        catch (error) {
            console.error("Something went wrong...", error);
        }
        finally {
            setLoading(false);
            setDeleteQuizId(null);
            setDeleteQuizName('');
        }
    };

    const handleGenerateReport = async (generateReportQuizId) => {
        try {
            setLoading(true);

            const response = await fetch(`https://localhost:7110/api/report/${generateReportQuizId}/GenerateReport`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.ok) {
                alert("Report has been generated and sent to the Course's chat!");
            }
            else {
                console.error("An error occurred while generating reports: ", response.statusText);
            }
        }
        catch (error) {
            console.error("Something went wrong...", error);
        }
        finally {
            setLoading(false);
        }
    }

    const isQuizActive = (scheduledTime, deadline) => {
        const now = new Date();
        const quizStart = new Date(scheduledTime);
        const quizEnd = new Date(deadline);
        return now >= quizStart && now <= quizEnd;
    };

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    useEffect(() => {
        disableButton();
        fetchQuizzes();
    }, []);

    return (
        <div className="quiz-container">
            <header className="quiz-header">
                {/* <div className="header-content">
                    <h1 className="course-name">{courseName}</h1>
                    <h2 className="quiz-heading">Quizzes</h2>
                </div> */}
                {isAdmin && (
                    <button
                        className="new-quiz-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#newQuizModal"
                    >
                        <i className="fas fa-plus"></i> New Quiz
                    </button>
                )}
            </header>

            {loading ? (
                <div className="loading-container">
                    <Spinner />
                </div>
            ) : (
                quizzes.length > 0 ? (
                    <div className="quiz-grid">
                        {quizzes.map((quiz) => {
                            const active = isQuizActive(quiz.scheduledTime, quiz.deadline);
                            return (
                                <div key={quiz.quizId} className="quiz-card">
                                    <div className="quiz-card-header">
                                        <div className="quiz-title-container">
                                            <h3 className="quiz-title">{quiz.title}</h3>
                                            <div className={`quiz-status ${active ? 'active' : new Date() > new Date(quiz.deadline) ? 'closed' : 'upcoming'}`}>
                                                {active ? 'Active' : new Date() > new Date(quiz.deadline) ? 'Closed' : 'Upcoming'}
                                            </div>
                                        </div>
                                        <p className="quiz-scheduled-time">
                                            <i className="far fa-calendar-alt"></i> {formatDate(quiz.scheduledTime)}
                                        </p>
                                    </div>
                                    <div className="quiz-card-body">
                                        <div className="quiz-detail">
                                            <span className="detail-label">
                                                <i className="far fa-clock"></i> Duration:
                                            </span>
                                            <span className="detail-value">{quiz.duration} minutes</span>
                                        </div>
                                        <div className="quiz-detail">
                                            <span className="detail-label">
                                                <i className="far fa-calendar-times"></i> Deadline:
                                            </span>
                                            <span className="detail-value">{formatDate(quiz.deadline)}</span>
                                        </div>
                                    </div>
                                    <div className="quiz-card-footer">
                                        <button
                                            className={`quiz-action-btn primary ${active ? 'active' : ''}`}
                                            // disabled={!active}
                                            onClick={() => {
                                                setQuizTitle(quiz.title);
                                                navigate(`/quizRoom/${quiz.quizId}/${quiz.duration}`);
                                            }}
                                        >
                                            {active ? 'Start Quiz' : new Date() > new Date(quiz.deadline) ? 'Ended' : 'Not Started'}
                                        </button>

                                        {isAdmin && (
                                            <div className="admin-actions">
                                                <button
                                                    className="quiz-action-btn secondary"
                                                    onClick={() => {
                                                        setQuizId(quiz.quizId);
                                                        setQuizTitle(quiz.title);
                                                        localStorage.setItem("QuizTitle", quiz.title);
                                                        navigate(`/questions/${quiz.quizId}/${new Date() > new Date(quiz.deadline)}`);
                                                    }}
                                                >
                                                    <i className="far fa-question-circle"></i> Questions
                                                </button>
                                                <button
                                                    className="quiz-action-btn secondary"
                                                    onClick={() => {
                                                        setQuizId(quiz.quizId);
                                                        setQuizTitle(quiz.title);
                                                        handleGenerateReport(quiz.quizId);
                                                    }}
                                                >
                                                    <i className="far fa-file-alt"></i> Report
                                                </button>
                                                <button
                                                    className="quiz-action-btn danger"
                                                    disabled={new Date() > new Date(quiz.deadline)}
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#deleteQuizModal"
                                                    onClick={() => {
                                                        setDeleteQuizName(quiz.title);
                                                        setDeleteQuizId(quiz.quizId);
                                                    }}
                                                >
                                                    <i className="far fa-trash-alt"></i> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-content">
                            <i className="fas fa-clipboard-list empty-icon"></i>
                            <h3>No quizzes available</h3>
                            <p>There are no quizzes for this course yet.</p>
                            {isAdmin && (
                                <button
                                    className="create-first-quiz-btn"
                                    data-bs-toggle="modal"
                                    data-bs-target="#newQuizModal"
                                >
                                    <i className="fas fa-plus"></i> Create First Quiz
                                </button>
                            )}
                        </div>
                    </div>
                )
            )}

            {/* New Quiz Modal */}
            {/* <div className="modal fade" id="newQuizModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Create New Quiz</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="quizTitle" className="form-label">Quiz Title</label>
                                <input
                                    type="text"
                                    id="quizTitle"
                                    className="form-control"
                                    placeholder="Enter quiz title"
                                    onChange={(e) => setQuizTitle(e.target.value)}
                                    value={quizTitle || ''}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Scheduled Time</label>
                                <DateTimeComponent onChange={(date) => setScheduledTime(date)} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="duration" className="form-label">Duration (minutes)</label>
                                <input
                                    id="duration"
                                    className="form-control"
                                    placeholder="Enter duration in minutes"
                                    value={duration || ''}
                                    onChange={(e) => setDuration(e.target.value)}
                                    type="number"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    setScheduledTime('');
                                    setDuration('');
                                    setQuizTitle('');
                                }}
                                data-bs-dismiss="modal"
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateQuiz}
                            >
                                Create Quiz
                            </button>
                        </div>
                    </div>
                </div>
            </div> */}
            <div className="modal fade" id="newQuizModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content gc-modal">
                        <div className="modal-header">
                            <h5 className="modal-title gc-modal-title">Create New Quiz</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="gc-form-group">
                                <label htmlFor="quizTitle" className="gc-form-label">Quiz Title</label>
                                <input
                                    type="text"
                                    id="quizTitle"
                                    className="gc-form-control"
                                    placeholder="Please enter the quiz title..."
                                    onChange={(e) => setQuizTitle(e.target.value)}
                                    value={quizTitle || ''}
                                />
                            </div>

                            <div className="gc-form-group">
                                <label className="gc-form-label">Scheduled Time</label>
                                <div className="gc-datetime-picker">
                                    <DateTimePicker
                                        value={scheduledTime}
                                        onChange={(date) => setScheduledTime(date)}
                                    />
                                </div>
                            </div>

                            <div className="gc-form-group">
                                <label htmlFor="duration" className="gc-form-label">Duration (minutes)</label>
                                <div className="gc-input-with-icon">
                                    <span className="material-icons">timer</span>
                                    <input
                                        id="duration"
                                        className="gc-form-control"
                                        placeholder="e.g. 30"
                                        value={duration || ''}
                                        onChange={(e) => setDuration(e.target.value)}
                                        type="number"
                                        min="1"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer gc-modal-footer">
                            <button
                                className="gc-button gc-button-text"
                                onClick={() => {
                                    setScheduledTime('');
                                    setDuration('');
                                    setQuizTitle('');
                                }}
                                data-bs-dismiss="modal"
                                id="closeUpdateModal"
                            >
                                Cancel
                            </button>
                            <button
                                className="gc-button gc-button-contained"
                                onClick={handleCreateQuiz}
                                disabled={!quizTitle || !scheduledTime || !duration}
                            >
                                Create Quiz
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Quiz Modal */}
            <div className="modal fade" id="deleteQuizModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Delete Quiz</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="delete-confirmation">
                                <div className="warning-icon">
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                                <h4>Delete "{deleteQuizName}"?</h4>
                                <p>This will permanently delete the quiz and all associated questions and responses.</p>
                                <p className="warning-text">This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleDeleteQuiz(deleteQuizId)}
                                data-bs-dismiss="modal"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Quiz;