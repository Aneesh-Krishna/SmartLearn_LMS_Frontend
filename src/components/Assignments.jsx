import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Spinner from './Loading';
import { jwtDecode } from "jwt-decode";
import { deleteAssignment, downloadAssignmentFile, fetchAllAssignments, uploadAssignment } from "../services/AssignmentService";
import '../styles/Assignments.css';

function Assignments({ authToken, courseId, courseName, adminId, admin, setAssignmentId, setAssignmentText }) {
    document.title = 'Assignments: SmartLearn_LMS';

    const [assignmentText, setAssignmentTextLocal] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [deleteAssignmentName, setDeleteAssignmentName] = useState('');
    const [deleteAssignmentId, setDeleteAssignmentId] = useState(null);
    const [showEmptyState, setShowEmptyState] = useState(false);

    const disabledRemoveButton = async (authToken) => {
        const decodedToken = jwtDecode(authToken);
        setIsAdmin(adminId === decodedToken.sub);
    };

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const data = await fetchAllAssignments(courseId, authToken);
            const assignmentsData = data?.$values || [];
            setAssignments(assignmentsData);

            // Show empty state animation after a brief loading period if no assignments
            setTimeout(() => {
                setShowEmptyState(assignmentsData.length === 0);
            }, 500);
        } catch (error) {
            console.error("Error fetching assignments: ", error);
            setShowEmptyState(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
        disabledRemoveButton(authToken);
    }, [authToken, courseId, adminId]);

    const handleUploadAssignment = async () => {
        if (!assignmentText.trim()) return;

        try {
            setLoading(true);
            const newAssignment = await uploadAssignment(courseId, assignmentText, file, authToken);
            setAssignments((prev) => [...prev, newAssignment]);
            setAssignmentTextLocal('');
            setFile(null);
            setShowEmptyState(false);
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
            setLoading(true);
            await deleteAssignment(assignmentId, authToken);
            await fetchAssignments();
        } catch (error) {
            console.error("Error while deleting the assignment...", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        // Format date to display as "May 1, 2025"
        return new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="assignments-page">
            <div className="assignments-container">
                <div className="assignments-header">
                    {/* <NavLink to="/courseDetails" className="back-button">
                        <i className="material-icons">arrow_back</i>
                        <span>Back</span>
                    </NavLink> */}

                    {isAdmin && (
                        <button
                            className="upload-button"
                            data-bs-toggle="modal"
                            data-bs-target="#uploadAssignmentModal"
                        >
                            <i className="material-icons">add</i>
                            Upload Assignment
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-animation">
                            <div className="loading-dot"></div>
                            <div className="loading-dot"></div>
                            <div className="loading-dot"></div>
                        </div>
                    </div>
                ) : showEmptyState ? (
                    <div className="no-assignments">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p>No assignments found!</p>
                        {isAdmin && <p className="empty-state-subtext">Click the "Upload Assignment" button to create your first assignment.</p>}
                    </div>
                ) : (
                    <div className="assignments-list">
                        {assignments.map((assignment) => (
                            <div key={assignment.assignmentId} className="assignment-card">
                                <div className="assignment-card-header">
                                    <h3>{assignment.text}</h3>
                                    <div className="assignment-status">
                                        <span className="due-badge">Due in 10 days</span>
                                    </div>
                                </div>
                                <div className="assignment-card-body">
                                    <div className="file-attachment">
                                        {assignment.assignmentFileName ? (
                                            <button
                                                className="attachment-button"
                                                onClick={() => handleDownload(assignment.assignmentFileName)}
                                            >
                                                <i className="material-icons">description</i>
                                                <span className="file-name">{assignment.assignmentFileName}</span>
                                            </button>
                                        ) : (
                                            <div className="no-attachment">No file attached</div>
                                        )}
                                    </div>
                                </div>
                                <div className="assignment-card-footer">
                                    <NavLink
                                        to="/submitAssignment"
                                        onClick={() => {
                                            setAssignmentText(assignment.text);
                                            setAssignmentId(assignment.assignmentId);
                                        }}
                                        className="submit-button"
                                    >
                                        <i className="material-icons">assignment_turned_in</i>
                                        Submit
                                    </NavLink>
                                    {isAdmin && (
                                        <button
                                            className="delete-button"
                                            data-bs-toggle="modal"
                                            data-bs-target="#deleteAssignmentModal"
                                            onClick={() => {
                                                setDeleteAssignmentName(assignment.text);
                                                setDeleteAssignmentId(assignment.assignmentId);
                                            }}
                                        >
                                            <i className="material-icons">delete</i>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Assignment Modal */}
                <div className="modal fade" id="uploadAssignmentModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create Assignment</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="assignmentText">Assignment Title</label>
                                    <input
                                        type="text"
                                        id="assignmentText"
                                        className="form-control"
                                        placeholder="Enter assignment title"
                                        onChange={(e) => setAssignmentTextLocal(e.target.value)}
                                        value={assignmentText}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="assignmentFile">Attachment (Optional)</label>
                                    <input
                                        type="file"
                                        id="assignmentFile"
                                        className="form-control"
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="modal-cancel-button" data-bs-dismiss="modal">Cancel</button>
                                <button
                                    className="modal-submit-button"
                                    onClick={handleUploadAssignment}
                                    data-bs-dismiss="modal"
                                    disabled={!assignmentText.trim()}
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Assignment Modal */}
                <div className="modal fade" id="deleteAssignmentModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Delete Assignment</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="delete-warning">
                                    <i className="material-icons">warning</i>
                                    This action cannot be undone
                                </div>
                                <p>Are you sure you want to delete the assignment: <strong>{deleteAssignmentName}</strong>?</p>
                                <p className="delete-note">All student submissions associated with this assignment will also be deleted.</p>
                            </div>
                            <div className="modal-footer">
                                <button className="modal-cancel-button" data-bs-dismiss="modal">Cancel</button>
                                <button
                                    className="modal-delete-button"
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
        </div>
    );
}

export default Assignments;