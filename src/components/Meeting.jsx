import React, { useEffect, useState, useRef } from "react";
import Spinner from './Loading';
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { fetchAllMeetings, createMeeting } from "../services/MeetingService";
import "../styles/Meeting.css"; // Assuming you have a CSS file for additional styles

function Meeting({ authToken, adminId, courseId, courseName }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [meetingName, setMeetingName] = useState('');
    const navigate = useNavigate();

    const disableButton = async (authToken) => {
        const decodedToken = jwtDecode(authToken);
        setIsAdmin(adminId === decodedToken.sub);
    };

    const handleCreateMeeting = async () => {
        if (!meetingName.trim()) {
            alert("Meeting name cannot be empty!");
            return;
        }

        try {
            setLoading(true);
            const newMeeting = await createMeeting(courseId, authToken, meetingName);
            setMeetings((prev) => [...prev, newMeeting]);
            setMeetingName('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMeetings = async () => {
        try {
            setLoading(true);
            const data = await fetchAllMeetings(courseId, authToken);
            setMeetings(data?.$values || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinMeeting = async (meetingId) => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://localhost:7110/api/meeting/${meetingId}/joinMeeting`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response.ok) {
                navigate(`/meetingRoomPage/${meetingId}`);
            } else {
                console.error(response.statusText);
            }
        } catch (error) {
            console.error("Something went wrong...", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEndMeeting = async (meetingId) => {
        try{
            setLoading(true)
            
            const response = await fetch(`https://localhost:7110/api/meeting/${meetingId}/EndMeeting`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            })
            if(response.ok){
                fetchMeetings()
            }
            else{
                console.error("An error occured while ending the meeting: ", response.statusText)
            }
        }
        catch(error){
            console.error("Something went wrong...",error);
        }
        finally{
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMeetings();
        disableButton(authToken);
    }, []);

    return (
        <div className="container meeting-page">
            <div className="header">
                <h1 className="course-title">Meeting Room of {courseName}</h1>
                <button
                    className="btn btn-primary new-meeting-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#createMeetingModal"
                    disabled={!isAdmin}
                >
                    New Meeting
                </button>
            </div>

            <ul className="meeting-list">
                {loading ? (
                    <div className="spinner-container">
                        <Spinner />
                    </div>
                ) : (
                    meetings.length > 0 ? (
                        meetings.map((meeting) => (
                            <li key={meeting.meetingId} className="meeting-item">
                                <div className="meeting-info">
                                    <span className="meeting-name">{meeting.meetingName}</span>
                                    <span className="meeting-status">
                                        {meeting.hasEnded ? " (Ended)" : (
                                            <div className="meeting-actions">
                                                <input
                                                    className="meeting-id"
                                                    value={meeting.meetingId}
                                                    readOnly
                                                    title="Generated Room ID"
                                                />
                                                <button
                                                    className="btn btn-success join-meeting-btn"
                                                    disabled={!isAdmin}
                                                    onClick={() => handleEndMeeting(meeting.meetingId)}
                                                >
                                                    End
                                                </button>
                                                <button
                                                    className="btn btn-success join-meeting-btn"
                                                    disabled={meeting.hasEnded}
                                                    onClick={() => handleJoinMeeting(meeting.meetingId)}
                                                >
                                                    Join
                                                </button>
                                            </div>
                                        )}
                                    </span>
                                </div>
                                
                            </li>
                        ))
                    ) : (
                        <p className="no-meetings">No meetings created yet!</p>
                    )
                )}
            </ul>

            {/* Modal for creating meetings */}
            <div className="modal fade" id="createMeetingModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Create Meeting</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter meeting name"
                                value={meetingName}
                                onChange={(e) => setMeetingName(e.target.value)}
                            />
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateMeeting}
                                data-bs-dismiss="modal"
                                disabled={!isAdmin}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <NavLink to="/courseDetails" className="return-link">
                Back to Course
            </NavLink>
        </div>
    );
}

export default Meeting;
