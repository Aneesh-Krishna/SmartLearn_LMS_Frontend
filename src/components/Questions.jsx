import React, { useEffect, useId, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Spinner from './Loading';
import '../styles/Questions.css';

function Questions({ authToken, adminId, quizTitle, questionId, setQuestionId, questionText, setQuestionText }) {
  const { quizId } = useParams();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [deleteQuestion, setDeleteQuestion] = useState('');
  const [deleteQuestionId, setDeleteQuestionId] = useState(null);
  const [questionDifficulty, setQuestionDifficulty] = useState('');
  const [questionPoints, setQuestionPoints] = useState('');
  const [difficultyInputId] = useId();
  const [pointsInputId] = useId();
  const navigate = useNavigate();

  const disableButton = () => {
    const decodedToken = jwtDecode(authToken);
    setIsAdmin(adminId === decodedToken.sub);
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5116/api/question/${quizId}/getAllQuestions`, {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data?.$values || []);
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

      const response = await fetch(`http://localhost:5116/api/question/${quizId}/AddQuestion`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: form,
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions((prev) => [...prev, data]);
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
      const response = await fetch(`http://localhost:5116/api/question/${deleteQuestionId}/DeleteQuestion`, {
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

  useEffect(() => {
    fetchQuestions();
    disableButton();
  }, []);

  return (
    <div className="questions-container">
      <NavLink to="/quiz" className="back-link">◄ Back</NavLink>
      <h2 className="quiz-title">Questions: {quizTitle}</h2>
      {isAdmin && (
        <button
          className="btn btn-primary new-question-btn"
          data-bs-toggle="modal"
          data-bs-target="#newQuestionModal"
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
              <div>
                {questions.map((question) => (
                  <li key={question.questionId} className="question-item">
                    <p className="question-text">{question.text}</p>
                    <p className="question-details">Difficulty: {question.difficulty} | Points: {question.points}</p>
                    {isAdmin && (
                      <div className="buttons">
                        <button
                          className="to-options-btn"
                          onClick={() => {
                            setQuestionId(question.questionId);
                            setQuestionText(question.text);
                            navigate(`/options/${question.questionId}`);
                          }}
                        >
                          Options
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm delete-btn"
                          data-bs-toggle="modal"
                          data-bs-target="#deleteQuestionModal"
                          onClick={() => {
                            setDeleteQuestion(question.text);
                            setDeleteQuestionId(question.questionId);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </div>
            ) : (
              <div>No questions!</div>
            )}
          </ul>
        </div>
      )}

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
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setQuestionText('');
                  setQuestionDifficulty('');
                  setQuestionPoints('');
                }}
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateQuestion}>
                Create
              </button>
            </div>
          </div>
        </div>
      </div>

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
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteQuestion(deleteQuestionId)}
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

export default Questions;