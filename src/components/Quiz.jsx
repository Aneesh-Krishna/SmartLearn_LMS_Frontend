import React, { useEffect, useId, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Spinner from './Loading';
import { NavLink, useNavigate } from 'react-router-dom';
import DateTimeComponent from './DateTimeComponent';
import '../styles/Quiz.css'; // Import custom CSS file

function Quiz({ authToken, adminId, admin, courseId, courseName, setQuizId, quizTitle, setQuizTitle }) {
    const [quizzes, setQuizzes] = useState([]); a
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deleteQuizId, setDeleteQuizId] = useState(null);
    const [deleteQuizName, setDeleteQuizName] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [duration, setDuration] = useState('');
    const [durationInputId] = useId();
    const navigate = useNavigate();

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

                const modal = document.getElementById('newQuizModal');
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide();
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
            setQuizTitle('');
            setScheduledTime('');
            setDuration('');
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
            setLoading(true)

            const respone = await fetch(`https://localhost:7110/api/report/${generateReportQuizId}/GenerateReport`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (respone.ok) {
                setLoading(false)
                alert("Report has been generated and sent to the Course's chat!")
            }
            else {
                setLoading(false)
                console.error("An error occured while generating reports: ", respone.statusText);
            }
        }
        catch (error) {
            console.error("Something went wrong...", error);
            setLoading(false)
        }
    }

    useEffect(() => {
        disableButton();
        fetchQuizzes();
    }, []);

    return (
        <div className="quiz-container">
            <NavLink to="/courseDetails" className="back-link">◄ Back</NavLink>
            <h2 className="quiz-heading">{courseName}: Quizzes</h2>
            {isAdmin && (
                <button
                    className="btn btn-primary new-quiz-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#newQuizModal"
                >
                    New Quiz
                </button>
            )}
            {loading ? (
                <div className="loading-container">
                    <Spinner />
                </div>
            ) : (
                quizzes.length > 0 ? (
                    <ul className="quiz-list">
                        {quizzes.map((quiz) => (
                            <li key={quiz.quizId} className="quiz-item">
                                <div className="card quiz-card">
                                    <div className="quiz-card-header">
                                        <h2 className="quiz-title">{quiz.title}</h2>
                                        <p className="quiz-scheduledTime">Scheduled for: {quiz.scheduledTime}</p>
                                    </div>
                                    <div className="card-body">
                                        <p className="card-text">Duration: {quiz.duration} mins</p>
                                        <p className="card-text">Deadline: {quiz.deadline}</p>
                                    </div>
                                    <div className="quiz-card-footer">
                                        <button
                                            className='participateInQuiz'
                                            // disabled={new Date() < new Date(quiz.scheduledTime) || new Date() > new Date(quiz.deadline)}
                                            onClick={() => {
                                                setQuizTitle(quiz.title);
                                                navigate(`/quizRoom/${quiz.quizId}/${quiz.duration}`);
                                            }}
                                        >
                                            Participate
                                        </button>

                                        {isAdmin && (
                                            <div className="button-group">
                                                <button className="to-questions-btn" onClick={() => (setQuizId(quiz.quizId), setQuizTitle(quiz.quizTitle), navigate(`/questions/${quiz.quizId}`))}>
                                                    Questions
                                                </button>
                                                <button className="generate-report-btn" onClick={() => (setQuizId(quiz.quizId), setQuizTitle(quiz.quizTitle), handleGenerateReport(quiz.quizId))}>
                                                    Generate Report
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm delete-btn"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#deleteQuizModal"
                                                    onClick={() => {
                                                        setDeleteQuizName(quiz.title);
                                                        setDeleteQuizId(quiz.quizId);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No quiz!</p>
                )
            )}

            {/* New Quiz Modal */}
            <div className="modal fade" id="newQuizModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">New Quiz</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <input
                                type="text"
                                className="form-control mb-3"
                                placeholder="Enter the quiz title"
                                onChange={(e) => setQuizTitle(e.target.value)}
                                value={quizTitle || ''}
                            />
                            <DateTimeComponent onChange={(date) => setScheduledTime(date)} />
                            <input placeholder='Duration' value={duration || ''} id={durationInputId} onChange={(e) => setDuration(e.target.value)} name="duration" title='Duration' type="number" />
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => (setScheduledTime(''), setDuration(''), setQuizTitle(''))} data-bs-dismiss="modal">Cancel</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateQuiz}
                            >
                                Create
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
                            Are you sure you want to delete <b>{deleteQuizName}</b>?
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
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
