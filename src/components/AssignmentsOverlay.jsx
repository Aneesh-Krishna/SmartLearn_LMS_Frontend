import React, { useEffect, useState } from "react";
import "../styles/AssignmentsOverlay.css";
import { jwtDecode } from "jwt-decode";
import { deleteAssignment, downloadAssignmentFile, fetchAllAssignments, uploadAssignment } from "../services/AssignmentService";

function AssignmentsOverlay({ authToken, courseId, courseName, adminId, isAssignmentsOpen, toggleAssignments, setAssignmentId, setAssignmentText }) {
    const [assignmentTextLocal, setAssignmentTextLocal] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [deleteAssignmentName, setDeleteAssignmentName] = useState('');
    const [deleteAssignmentId, setDeleteAssignmentId] = useState(null);
    const [showEmptyState, setShowEmptyState] = useState(false);

    const checkIsAdmin = async (authToken) => {
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
        if (isAssignmentsOpen) {
            fetchAssignments();
            checkIsAdmin(authToken);
        }
    }, [isAssignmentsOpen, authToken, courseId, adminId]);

    const handleUploadAssignment = async () => {
        if (!assignmentTextLocal.trim()) return;

        try {
            setLoading(true);
            const newAssignment = await uploadAssignment(courseId, assignmentTextLocal, file, authToken);
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

    const formatDate = () => {
        // Format date to display as "Apr 28, 2025"
        return new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className={`gc-assignments-overlay ${isAssignmentsOpen ? 'open' : ''}`}>
            <div className="gc-assignments-content">
                <div className="gc-assignments-header">
                    <h2 className="gc-assignments-title">{courseName}: Assignments</h2>
                    <div className="gc-header-actions">
                        {isAdmin && (
                            <button
                                className="gc-button gc-button-contained"
                                data-bs-toggle="modal"
                                data-bs-target="#uploadAssignmentModal"
                            >
                                <span className="material-icons">add</span>
                                Upload Assignment
                            </button>
                        )}
                        <button className="gc-icon-button gc-close-btn" onClick={toggleAssignments}>
                            <span className="material-icons">close</span>
                        </button>
                    </div>
                </div>

                <div className="gc-assignments-body">
                    {loading ? (
                        <div className="gc-loading-animation">
                            <div className="gc-loading-dot"></div>
                            <div className="gc-loading-dot"></div>
                            <div className="gc-loading-dot"></div>
                        </div>
                    ) : showEmptyState ? (
                        <div className="gc-no-assignments">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p>No assignments found!</p>
                            {isAdmin && <p className="mt-3">Click the "Upload Assignment" button to create your first assignment.</p>}
                        </div>
                    ) : (
                        <div className="gc-assignments-grid">
                            {assignments.map((assignment) => (
                                <div key={assignment.assignmentId} className="gc-assignment-card">
                                    <div className="gc-assignment-header">
                                        <h3>{assignment.text}</h3>
                                        <div className="gc-assignment-date">Posted: {formatDate()}</div>
                                    </div>
                                    <div className="gc-assignment-body">
                                        <p>All students must submit within 10 days.</p>
                                        <div className="gc-file-section">
                                            {assignment.assignmentFileName ? (
                                                <button
                                                    className="gc-file-button"
                                                    onClick={() => handleDownload(assignment.assignmentFileName)}
                                                >
                                                    <span className="material-icons">attach_file</span>
                                                    {assignment.assignmentFileName}
                                                </button>
                                            ) : (
                                                <div className="gc-no-file">No file attached</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="gc-assignment-footer">
                                        <button
                                            className="gc-submit-button"
                                            onClick={() => {
                                                setAssignmentText(assignment.text);
                                                setAssignmentId(assignment.assignmentId);
                                                // Redirect logic would go here or use a modal for submission
                                                // For overlay, we could show a submission form within the overlay
                                            }}
                                        >
                                            <span className="material-icons">assignment_turned_in</span>
                                            Submit
                                        </button>
                                        {isAdmin && (
                                            <button
                                                className="gc-delete-button"
                                                data-bs-toggle="modal"
                                                data-bs-target="#deleteAssignmentModal"
                                                onClick={() => {
                                                    setDeleteAssignmentName(assignment.text);
                                                    setDeleteAssignmentId(assignment.assignmentId);
                                                }}
                                            >
                                                <span className="material-icons">delete</span>
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Assignment Modal */}
            <div className="modal fade" id="uploadAssignmentModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content gc-modal">
                        <div className="modal-header">
                            <h5 className="modal-title">Create Assignment</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group mb-3">
                                <label htmlFor="assignmentText" className="form-label">Assignment Title</label>
                                <input
                                    type="text"
                                    id="assignmentText"
                                    className="form-control"
                                    placeholder="Enter assignment title"
                                    onChange={(e) => setAssignmentTextLocal(e.target.value)}
                                    value={assignmentTextLocal}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="assignmentFile" className="form-label">Attachment (Optional)</label>
                                <input
                                    type="file"
                                    id="assignmentFile"
                                    className="form-control"
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="gc-button gc-button-text" data-bs-dismiss="modal">Cancel</button>
                            <button
                                className="gc-button gc-button-contained"
                                onClick={handleUploadAssignment}
                                data-bs-dismiss="modal"
                                disabled={!assignmentTextLocal.trim()}
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
                    <div className="modal-content gc-modal">
                        <div className="modal-header">
                            <h5 className="modal-title">Delete Assignment</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="gc-delete-warning">
                                <span className="material-icons">warning</span>
                                This action cannot be undone
                            </div>
                            <p>Are you sure you want to delete the assignment: <strong>{deleteAssignmentName}</strong>?</p>
                            <p className="gc-delete-note">All student submissions associated with this assignment will also be deleted.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="gc-button gc-button-text" data-bs-dismiss="modal">Cancel</button>
                            <button
                                className="gc-button gc-button-contained gc-button-danger"
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

export default AssignmentsOverlay;