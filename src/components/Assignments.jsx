import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Spinner from './Loading';
import { jwtDecode } from "jwt-decode";
import { deleteAssignment, downloadAssignmentFile, fetchAllAssignments, uploadAssignment } from "../services/AssignmentService";
import "../styles/Assignments.css";

function Assignments({ authToken, courseId, courseName, adminId, setAssignmentId, setAssignmentText }) {
    document.title = 'Assignments: ClassroomApp';

    const [assignmentText, setAssignmentTextLocal] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteAssignmentName, setDeleteAssignmentName] = useState('');
    const [deleteAssignmentId, setDeleteAssignmentId] = useState(null);
    const navigate = useNavigate();
    const deleteModalRef = useRef(null);

    const disabledRemoveButton = async (authToken) => {
        const decodedToken = jwtDecode(authToken);
        setIsAdmin(adminId === decodedToken.sub);
    };

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const data = await fetchAllAssignments(courseId, authToken);
            setAssignments(data?.$values || []);
        } catch (error) {
            console.error("Error fetching assignments: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
        disabledRemoveButton(authToken);
    }, []);

    const handleUploadAssignment = async () => {
        try {
            setLoading(true);
            const newAssignment = await uploadAssignment(courseId, assignmentText, file, authToken);
            setAssignments((prev) => [...prev, newAssignment]);
            setAssignmentTextLocal('');
            setFile(null);
        } catch (error) {
            console.error("Error uploading assignment: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (assignmentFileName) => {
        try {
            await downloadAssignmentFile(assignmentFileName, authToken);
        } catch (error) {
            console.error("Error downloading the assignment: ", error);
        }
    };

    const handleDeleteAssignment = async (assignmentId) => {
        try {
            await deleteAssignment(assignmentId, authToken);
            fetchAssignments(); // Refresh the list after deletion
            console.log("Assignment deleted, refreshing list...");
        } catch (error) {
            console.error("Error while deleting the assignment...", error);
        }
    };

    const handleDeleteClick = (assignment) => {
        setDeleteAssignmentName(assignment.text);
        setDeleteAssignmentId(assignment.assignmentId);
        const modal = deleteModalRef.current;
        if (modal) {
            const bootstrapModal = new (window.bootstrap.Modal)(modal);
            bootstrapModal.show();
            console.log("Modal opened for assignment:", assignment.text);
        } else {
            console.error("Modal reference not found!");
        }
    };

    const handleSubmitClick = (assignment) => {
        setAssignmentText(assignment.text);
        setAssignmentId(assignment.assignmentId);
        navigate('/submitAssignment');
        console.log("Navigating to submit with ID:", assignment.assignmentId, "Text:", assignment.text);
    };

    return (
        <div className="materials-container">
            <div className="materials-header">
                <h1>
                    <NavLink to="/courseDetails" className="back-button">
                        <span className="back-icon">◄</span> Back
                    </NavLink>
                    Assignments
                </h1>
                {isAdmin && (
                    <button
                        className="upload-button"
                        data-bs-toggle="modal"
                        data-bs-target="#uploadAssignmentModal"
                    >
                        Upload Assignment
                    </button>
                )}
            </div>

            {loading ? (
                <div className="loading-animation">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                </div>
            ) : assignments.length > 0 ? (
                <div className="assignments-grid">
                    {assignments.map((assignment) => (
                        <div key={assignment.assignmentId} className="assignment-card">
                            <div className="assignment-header">
                                <h3>{assignment.text}</h3>
                            </div>
                            <div className="assignment-body">
                                <div className="file-section">
                                    {assignment.assignmentFileName ? (
                                        <button
                                            className="file-button"
                                            onClick={() => handleDownload(assignment.assignmentFileName)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="7 10 12 15 17 10"></polyline>
                                                <line x1="12" y1="15" x2="12" y2="3"></line>
                                            </svg>
                                            {assignment.assignmentFileName}
                                        </button>
                                    ) : (
                                        <span className="no-file">No file available</span>
                                    )}
                                </div>
                                <p className="assignment-info">All students must submit within 10 days.</p>
                            </div>
                            <div className="assignment-footer">
                                <button
                                    onClick={() => handleSubmitClick(assignment)}
                                    className="btn-action"
                                >
                                    Submit
                                </button>
                                {isAdmin && (
                                    <button
                                        className="btn-action btn-action-danger"
                                        onClick={() => {console.log("delete clicked"); handleDeleteClick(assignment); }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-materials">
                    <span className="no-materials-icon">📚</span>
                    No assignments available for this course yet.
                </div>
            )}

            {/* Upload Assignment Modal (Original Design) */}
            <div className="modal fade" id="uploadAssignmentModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Upload Assignment</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="assignmentText">Assignment Text</label>
                                <input
                                    id="assignmentText"
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter assignment text"
                                    onChange={(e) => setAssignmentTextLocal(e.target.value)}
                                    value={assignmentText}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="assignmentFile">Upload File</label>
                                <input
                                    id="assignmentFile"
                                    type="file"
                                    className="form-control"
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn modal-cancel-button" data-bs-dismiss="modal">Cancel</button>
                            <button
                                className="btn modal-submit-button"
                                onClick={handleUploadAssignment}
                                data-bs-dismiss="modal"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Assignment Modal */}
            <div className="modal fade" id="deleteAssignmentModal" tabIndex="-1" aria-hidden="true" ref={deleteModalRef}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Delete Assignment</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p className="delete-warning">Are you sure you want to delete <b>{deleteAssignmentName}</b>?</p>
                            <p className="delete-note">This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-action-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button
                                className="btn btn-action-danger"
                                onClick={() => handleDeleteAssignment(deleteAssignmentId)}
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

export default Assignments;