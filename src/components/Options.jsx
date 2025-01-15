import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import Spinner from './Loading';
import { jwtDecode } from 'jwt-decode';
import '../styles/Options.css'; // Import custom CSS

function Options({ authToken, adminId, quizId, questionText }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [options, setOptions] = useState([]);
    const [optionText, setOptionText] = useState('');
    const [optionsIsCorrect, setOptionIsCorrect] = useState(false);
    const { questionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [deleteOptionId, setDeleteOptionId] = useState(null);
    const [deleteOption, setDeleteOption] = useState('');

    const disableButton = () => {
        const decodedToken = jwtDecode(authToken);
        setIsAdmin(adminId === decodedToken.sub);
    };

    const fetchOptions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://localhost:7110/api/option/${questionId}/getAllOptions`, {
                method: "GET",
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.ok) {
                const data = await response.json();
                setOptions(data?.$values || []);
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

            const response = await fetch(`https://localhost:7110/api/option/${questionId}/addOption`, {
                method: "POST",
                headers: { Authorization: `Bearer ${authToken}` },
                body: form,
            });

            if (response.ok) {
                const data = await response.json();
                setOptions((prev) => [...prev, data]);
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
                fetchOptions();
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

    useEffect(() => {
        fetchOptions();
        disableButton();
    }, []);

    return (
        <div className="options-container">
            <NavLink to={`/questions/${quizId}`} className="back-link">◄ Back</NavLink>
            <h2 className="question-title">Options for: {questionText}</h2>
            {isAdmin && (
                <button
                    className="btn btn-primary new-option-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#newOptionModal"
                >
                    New Option
                </button>
            )}
            {loading ? (
                <div className="loading-container">
                    <Spinner />
                </div>
            ) : (
                <div className="options-list">
                    <ul>
                        {options.length > 0 ? (
                            options.map((option) => (
                                <li key={option.optionId} className="option-item">
                                    <span className="option-text">{option.text}</span>
                                    <span className="option-correct">Correct: {option.isCorrect ? "Yes" : "No"}</span>
                                    <button
                                        className="btn btn-outline-danger btn-sm delete-btn"
                                        data-bs-toggle="modal"
                                        data-bs-target="#deleteOptionModal"
                                        onClick={() => {
                                            setDeleteOption(option.text);
                                            setDeleteOptionId(option.optionId);
                                        }}
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))
                        ) : (
                            <p>No Options!</p>
                        )}
                    </ul>
                </div>
            )}

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
    );
}

export default Options;
