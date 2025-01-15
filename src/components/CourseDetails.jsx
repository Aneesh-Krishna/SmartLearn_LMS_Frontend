import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Spinner from './Loading';
import '../styles/CourseDetails.css';

function CourseDetails({ authToken, courseId, courseName, admin, adminId, description }) {
    document.title = 'Course Details: Assignment App';

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [searchUserName, setSearchUserName] = useState('');
    const [searchUserNameResults, setSearchUsernameResults] = useState([])
    const [selectedUserId, setSelectedUserId] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)

    const disabledRemoveButton = async (authToken) => {
        const decodedToken = jwtDecode(authToken);
        setIsAdmin(adminId === decodedToken.sub);
    }

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://localhost:7110/api/course/${courseId}/members`, {
                method: "GET",
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.ok) {
                const data = await response.json();
                setMembers(data?.$values || []);
            } else {
                console.error("Failed to fetch courses:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
        disabledRemoveButton(authToken);
    }, [authToken, adminId]);

    const handleDelete = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch(`https://localhost:7110/api/course/${courseId}`, {
                method: "DELETE",
                headers: { 
                    'Authorization': `Bearer ${authToken}`,
                },
            })

            if (response.ok) {
                navigate('/courses')
            } else {
                console.error("Failed to delete the course: " + response.statusText)
            }
        } catch (error) {
            console.error("Something went wrong... ", error)
        }
    }

    const handleSearchUser = async (e) => {
        e.preventDefault()
        if (!searchUserName.trim()) return;

        try {
            const response = await fetch(`https://localhost:7110/api/account/${searchUserName}/users`, {
                method: "GET",
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.ok) {
                const data = await response.json()
                setSearchUsernameResults(data?.$values || [])
            } else {
                const errorData = await response.json()
                console.error(errorData)
            }
        } catch (error) {
            console.error("Something went wrong...", error);
        }
    }

    const handleAddUser = async (e) => {
        e.preventDefault()
        try {
            const form = new FormData()
            form.append('newUserId', selectedUserId)

            const response = await fetch(`https://localhost:7110/api/course/${courseId}/AddMember`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: form,
            });

            if (response.ok) {
                setSelectedUserId('')
                fetchCourses()
            } else {
                const errorData = await response.json()
                console.error(errorData)
            }
        } catch (error) {
            console.error("Something went wrong...", error)
        }
    }

    const handleRemoveUser = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch(`https://localhost:7110/api/course/${selectedUserId}/RemoveMember`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.ok) {
                setSelectedUserId('')
                fetchCourses()
            } else {
                const errorData = await response.json()
                console.error(errorData)
            }
        } catch (error) {
            console.error("Something went wrong...", error);
        }
    }

    return (
        <div className="course-details-container">
            <div className="course-header">
                <h1 className="course-title">{courseName}</h1>
                <p className="course-admin">Admin: <strong>{admin}</strong></p>
                <p className="course-description">{description}</p>
            </div>

            <div className="course-members">
                <h2>
                    Members
                    {isAdmin && (
                        <button 
                            onClick={() => (setSearchUserName(''), setSearchUsernameResults(''))} 
                            data-bs-toggle="modal" 
                            data-bs-target="#staticBackdrop"
                            className="add-member-btn"
                        >
                            Add Member
                        </button>
                    )}
                </h2>
                {loading ? (
                    <Spinner />
                ) : members.length > 0 ? (
                    <ul className="member-list">
                        {members.map((member) => (
                            <li key={member.id} className="member-item">
                                <span className="member-icon">👤</span>
                                {member.name}
                                {isAdmin && (
                                    <button 
                                        className="remove-icon" 
                                        data-bs-toggle="modal" 
                                        data-bs-target="#staticBackdropRemove" 
                                        onClick={() => setSelectedUserId(member.memberId)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-members-text">No Members!</p>
                )}
            </div>

            <div className="modal fade" id="staticBackdropRemove" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-body">
                            Are you sure you want to remove the user from {courseName}?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" disabled={!isAdmin} onClick={handleRemoveUser} className="btn btn-danger" data-bs-dismiss="modal">Remove</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title" id="staticBackdropLabel">Add Members</h2>
                            <form className="search-form" onSubmit={handleSearchUser}>
                                <input 
                                    className="search-input" 
                                    onChange={(e) => (setSearchUserName(e.target.value), setSearchUsernameResults(''))} 
                                    type="search" 
                                    placeholder="Search for users" 
                                    value={searchUserName} 
                                    aria-label="Search" 
                                />
                                <button className="search-button" type="submit">Search</button>
                            </form>
                        </div>
                        <div className="modal-body">
                            {searchUserNameResults.length > 0 ? (
                                <ul className="search-results-list">
                                    {searchUserNameResults.map((user) => (
                                        <li 
                                            key={user.id}
                                            className={`search-result-item ${selectedUserId === user.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedUserId(user.id)}
                                        >
                                            {user.userName}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No such user found!</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" onClick={() => (setSearchUserName(''), setSearchUsernameResults(''))} className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" disabled={!isAdmin} onClick={handleAddUser} className="btn btn-primary" data-bs-dismiss="modal">Add</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="course-actions">
                {isAdmin && (
                    <>
                        <NavLink to="/updateCourse" className="action-link">Edit</NavLink>
                        <button className="action-link delete-btn" data-bs-toggle="modal" data-bs-target="#exampleModal">
                            Delete
                        </button>
                    </>
                )}
                <NavLink to="/meetings" className="action-link">Meetings</NavLink>
                <NavLink to="/courseChats" className="action-link">Chats</NavLink>
                <NavLink to="/materials" className="action-link">Materials</NavLink>
                <NavLink to="/assignments" className="action-link">Assignments</NavLink>
                <NavLink to="/quiz" className="action-link">Quiz</NavLink>
                <NavLink to="/courses" className="action-link">Back to Courses</NavLink>
            </div>

            <div className="modal fade" id="exampleModal" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-body">
                            Are you sure you want to delete {courseName}?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" disabled={!isAdmin} onClick={handleDelete} className="btn btn-danger" data-bs-dismiss="modal">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseDetails;

