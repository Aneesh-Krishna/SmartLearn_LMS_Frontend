import { useEffect, useState } from "react";
import Spinner from './Loading';
import { NavLink } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/SubmitAssignment.css"

function SubmitAssignment({ authToken, adminId, admin, assignmentId, assignmentText }) {
    document.title = 'Submissions: SmartLearn_LMS';

    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [file, setFile] = useState(null);
    const [submissionText, setSubmissionText] = useState('');
    const [showEmptyState, setShowEmptyState] = useState(false);

    const disabledRemoveButton = async (authToken) => {
        const decodedToken = jwtDecode(authToken);
        if (adminId === decodedToken.sub) {
            setIsAdmin(true);
        }
    };

    const fetchAllSubmissions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5116/api/assignmentsubmission/${assignmentId}/GetAllAssignment-Submissions`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                }
            });

            if (response.ok) {
                const data = await response.json();
                const submissionsData = data?.$values || [];
                setSubmissions(submissionsData);

                // Show empty state after loading
                setTimeout(() => {
                    setShowEmptyState(submissionsData.length === 0);
                }, 500);
            } else {
                console.error("An error occurred while fetching the submissions: ", response.statusText);
                setShowEmptyState(true);
            }
        } catch (error) {
            console.error("Something went wrong...", error);
            setShowEmptyState(true);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSubmission = async () => {
        if (!submissionText.trim()) return;

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('text', submissionText);
            formData.append('file', file);

            const response = await fetch(`https://localhost:7110/api/assignmentsubmission/${assignmentId}/SubmitAssignment`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: formData,
            });

            if (response.ok) {
                const newSubmission = await response.json();
                setSubmissions((prev) => [...prev, newSubmission]);
                setSubmissionText('');
                setFile(null);
                setShowEmptyState(false);
            } else {
                console.error("An error occurred while submitting the assignment: ", response.statusText);
            }
        } catch (error) {
            console.error("Something went wrong...", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (submissionFileName) => {
        try {
            const response = await fetch(`https://localhost:7110/api/file/${submissionFileName}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.ok) {
                // Parse the response as a blob
                const blob = await response.blob();

                // Create a temporary link element to initiate the download
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = submissionFileName; // Suggest the filename for the downloaded file
                document.body.appendChild(link);
                link.click();

                // Clean up after download
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                console.error("An error occurred while downloading...", response.statusText);
            }
        } catch (error) {
            console.error("Something went wrong...:", error);
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

    useEffect(() => {
        fetchAllSubmissions();
        disabledRemoveButton(authToken);
    }, [authToken, assignmentId, adminId]);

    return (
        <div className="submissions-container">
            <div className="submissions-header">
                <h1>
                    <NavLink to="/assignments" className="btn-outline-primary">
                        <i className="material-icons">arrow_back</i>
                        Back
                    </NavLink>
                    Submissions: {assignmentText}
                </h1>
                <button
                    className="submit-button-action"
                    data-bs-toggle="modal"
                    data-bs-target="#uploadSubmissionModal"
                >
                    <i className="material-icons">add</i>
                    Add Submission
                </button>
            </div>

            {loading ? (
                <div className="loading-animation">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                </div>
            ) : showEmptyState ? (
                <div className="no-submissions">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p>No submissions yet!</p>
                    <p className="mt-3">Click the "Add Submission" button to submit your work.</p>
                </div>
            ) : (
                <div className="submissions-grid">
                    {submissions.map((submission) => (
                        <div key={submission.assignmentSubmissionId} className="submission-card">
                            <div className="submission-header">
                                <h3>Submission by {submission.submittedBy?.fullName || "User"}</h3>
                                <div className="submission-date">Submitted: {formatDate()}</div>
                            </div>
                            <div className="submission-body">
                                <p>{submission.text}</p>
                                <div className="file-section">
                                    {submission.submissionFileName ? (
                                        <button
                                            className="file-button"
                                            onClick={() => handleDownload(submission.submissionFileName)}
                                        >
                                            <i className="material-icons">attach_file</i>
                                            {submission.submissionFileName}
                                        </button>
                                    ) : (
                                        <div className="no-file">No file attached</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Submission Modal */}
            <div className="modal fade" id="uploadSubmissionModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Submit Assignment</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="submissionText">Your Response</label>
                                <textarea
                                    id="submissionText"
                                    className="form-control"
                                    rows="4"
                                    placeholder="Write your response here..."
                                    onChange={(e) => setSubmissionText(e.target.value)}
                                    value={submissionText}
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="submissionFile">Attachment (Optional)</label>
                                <input
                                    type="file"
                                    id="submissionFile"
                                    className="form-control"
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-cancel-button" data-bs-dismiss="modal">Cancel</button>
                            <button
                                className="modal-submit-button"
                                onClick={handleUploadSubmission}
                                data-bs-dismiss="modal"
                                disabled={!submissionText.trim()}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubmitAssignment;