import { useEffect, useState, useRef } from "react";
import "../styles/CourseDetails.css";
import "../styles/ChatOverlay.css";
import { NavLink, useNavigate } from "react-router-dom";
import Spinner from './Loading';
import { jwtDecode } from "jwt-decode";
import { HubConnectionBuilder } from "@microsoft/signalr";
import MaterialsOverlay from "./MaterialsOverlay"; // Import MaterialsOverlay component
import Assignments from "./Assignments"; // Import Assignments component
import MaterialsPage from "./MaterialsPage";
import Quiz from "./Quiz";
import UpdateCourse from "./UpdateCourse";

function CourseDetails({ authToken, courseId, courseName, admin, adminId, description }) {
    document.title = 'Course-details: SmartLearn_LMS';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [searchUserName, setSearchUserName] = useState('');
    const [searchUserNameResults, setSearchUsernameResults] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('people'); // Default to people tab
    const [assignmentId, setAssignmentId] = useState(null);
    const [assignmentText, setAssignmentText] = useState('');
    const [quizId, setQuizId] = useState(null);
    const [quizTitle, setQuizTitle] = useState('');
    const [descriptionUpdate, setDescription] = useState('');
    const [courseNameUpdate, setCourseName] = useState('');

    // Chat overlay state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chats, setChats] = useState(null);
    const [error, setError] = useState(null);
    const [file, setFile] = useState(null);
    const [chatMessage, setChatMessage] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const chatBodyRef = useRef(null);
    const connectionRef = useRef(null);

    // Materials overlay state
    const [isMaterialsOpen, setIsMaterialsOpen] = useState(false);

    //Update modal
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const disabledRemoveButton = async (authToken) => {
        const decodedToken = jwtDecode(authToken);
        if (adminId === decodedToken.sub) {
            setIsAdmin(true);
        }
    };

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5116/api/course/${courseId}/members`, {
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
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5116/api/course/${courseId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (response.ok) {
                navigate('/courses');
            }
        } catch (error) {
            console.error("Something went wrong... ", error);
        }
    };

    const handleSearchUser = async (e) => {
        e.preventDefault();
        if (!searchUserName.trim()) return;

        try {
            const response = await fetch(`http://localhost:5116/api/account/${searchUserName}/users`, {
                method: "GET",
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.ok) {
                const data = await response.json();
                setSearchUsernameResults(data?.$values || []);
            }
        } catch (error) {
            console.error("Something went wrong...", error);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const form = new FormData();
            form.append('newUserId', selectedUserId);

            const response = await fetch(`http://localhost:5116/api/course/${courseId}/AddMember`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: form,
            });

            if (response.ok) {
                setSelectedUserId('');
                fetchCourses();
            }
        } catch (error) {
            console.error("Something went wrong...", error);
        }
    };

    const handleRemoveUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5116/api/course/${selectedUserId}/RemoveMember`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.ok) {
                setSelectedUserId('');
                fetchCourses();
            }
        } catch (error) {
            console.error("Something went wrong...", error);
        }
    };

    const handleLeaveCourse = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5116/api/course/${courseId}/leaveCourse`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.ok) {
                navigate('/courses');
            }
        } catch (error) {
            console.error("Something went wrong... ", error);
        }
    };

    // Chat functionality
    const formatSentTime = (sentTime) => {
        const date = new Date(sentTime);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const fetchAllChats = async () => {
        try {
            const response = await fetch(`http://localhost:5116/api/chat/${courseId}/GetAllChats`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setChats(data?.$values || []);
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            setError(error.message);
            console.error("Error fetching chats:", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        try {
            const form = new FormData();
            form.append(`message`, chatMessage);
            if (file) {
                form.append(`file`, file);
                if (chatMessage === "") {
                    setChatMessage("Sent a file");
                }
            }

            const response = await fetch(`http://localhost:5116/api/chat/${courseId}/SendMessage`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: form,
            });

            if (response.ok) {
                setChatMessage('');
                setFile(null);
                setRefreshTrigger((prev) => prev + 1);
            } else {
                console.error("An error occurred while sending the message...", response.text);
            }
        } catch (error) {
            console.error("Something went wrong...", error);
        }
    };

    const handleDownloadFile = async (fileName) => {
        try {
            const response = await fetch(`http://localhost:5116/api/file/${fileName}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                console.error("An error occurred while downloading...", response.statusText);
            }
        } catch (error) {
            console.error("Something went wrong...:", error);
        }
    };

    // Toggle chat overlay
    const toggleChat = () => {
        if (!isChatOpen) {
            fetchAllChats();
            initializeSignalR();
            // Close materials overlay if it's open
            if (isMaterialsOpen) {
                setIsMaterialsOpen(false);
            }
            setActiveTab('chat');
        }
        else {
            setFile(null);
            setChatMessage('');
        }
        setIsChatOpen(!isChatOpen);
    };

    // Toggle materials overlay
    const toggleMaterials = () => {
        // Close chat overlay if it's open
        if (isChatOpen) {
            setIsChatOpen(false);
            setFile(null);
            setChatMessage('');
        }
        setIsMaterialsOpen(!isMaterialsOpen);
        setActiveTab('materials');
    };

    // Initialize SignalR connection
    const initializeSignalR = () => {
        if (!connectionRef.current) {
            connectionRef.current = new HubConnectionBuilder()
                .withUrl(`http://localhost:5116/chatHub`)
                .build();

            connectionRef.current
                .start()
                .then(() => {
                    console.log("SignalR connected");

                    connectionRef.current.invoke("JoinGroup", courseId.toString());

                    // Listen for new messages from SignalR
                    connectionRef.current.on("ReceiveMessage", (newMessage) => {
                        console.log("Message received!");
                        setChats(prevChats => {
                            if (!prevChats) return [newMessage];
                            const exists = prevChats.some(chat => chat.chatId === newMessage.chatId);
                            return exists ? prevChats : [...prevChats, newMessage];
                        });
                    });
                })
                .catch(err => console.log("Error starting SignalR connection: ", err));
        }
    };

    useEffect(() => {
        // Clean up the SignalR connection when the component unmounts
        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop();
                connectionRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        // Scroll to the bottom of the chat body whenever new chats are added or sent
        if (chatBodyRef.current && isChatOpen) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [chats, isChatOpen]);

    // Render the appropriate content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'assignments':
                return (
                    <div className="gc-tab-content">
                        <Assignments
                            authToken={authToken}
                            courseId={courseId}
                            courseName={courseName}
                            adminId={adminId}
                            admin={admin}
                            setAssignmentId={setAssignmentId}
                            setAssignmentText={setAssignmentText}
                        />
                    </div>
                );
            case 'people':
                return (
                    <div className="gc-tab-content">
                        {/* Teachers Section */}
                        <div className="gc-section">
                            <div className="gc-section-header">
                                <h2>Instructor</h2>
                            </div>
                            <div className="gc-section-content">
                                <div className="gc-person-item">
                                    <div className="gc-person-avatar">{admin.charAt(0)}</div>
                                    <div className="gc-person-info">
                                        <div className="gc-person-name">{admin}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Students Section */}
                        <div className="gc-section">
                            <div className="gc-section-header">
                                <h2>Students</h2>
                                {isAdmin && (
                                    <button
                                        className="gc-icon-button"
                                        onClick={() => (setSearchUserName(''), setSearchUsernameResults([]))}
                                        data-bs-toggle="modal"
                                        data-bs-target="#staticBackdrop"
                                    >
                                        <span className="material-icons">person_add</span>
                                    </button>
                                )}
                            </div>

                            <div className="gc-section-content">
                                {loading ? (
                                    <div className="gc-loader-container">
                                        <Spinner />
                                    </div>
                                ) : members.length > 0 ? (
                                    <div className="gc-people-list">
                                        {members.map((member) => (
                                            <div key={member.id} className="gc-person-item">
                                                <div className="gc-person-avatar">{member.name.charAt(0)}</div>
                                                <div className="gc-person-info">
                                                    <div className="gc-person-name">{member.name}</div>
                                                </div>
                                                {isAdmin && (
                                                    <button
                                                        className="gc-icon-button gc-remove-btn"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#staticBackdropRemove"
                                                        onClick={() => setSelectedUserId(member.memberId)}
                                                    >
                                                        <span className="material-icons">remove_circle_outline</span>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="gc-empty-state">
                                        <span className="material-icons gc-empty-icon">people</span>
                                        <p>No students in this class yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'chat':
                return (
                    <div className="gc-tab-content">
                        {/* Teachers Section */}
                        <div className="gc-section">
                            <div className="gc-section-header">
                                <h2>Instructor</h2>
                            </div>
                            <div className="gc-section-content">
                                <div className="gc-person-item">
                                    <div className="gc-person-avatar">{admin.charAt(0)}</div>
                                    <div className="gc-person-info">
                                        <div className="gc-person-name">{admin}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Students Section */}
                        <div className="gc-section">
                            <div className="gc-section-header">
                                <h2>Students</h2>
                                {isAdmin && (
                                    <button
                                        className="gc-icon-button"
                                        onClick={() => (setSearchUserName(''), setSearchUsernameResults([]))}
                                        data-bs-toggle="modal"
                                        data-bs-target="#staticBackdrop"
                                    >
                                        <span className="material-icons">person_add</span>
                                    </button>
                                )}
                            </div>

                            <div className="gc-section-content">
                                {loading ? (
                                    <div className="gc-loader-container">
                                        <Spinner />
                                    </div>
                                ) : members.length > 0 ? (
                                    <div className="gc-people-list">
                                        {members.map((member) => (
                                            <div key={member.id} className="gc-person-item">
                                                <div className="gc-person-avatar">{member.name.charAt(0)}</div>
                                                <div className="gc-person-info">
                                                    <div className="gc-person-name">{member.name}</div>
                                                </div>
                                                {isAdmin && (
                                                    <button
                                                        className="gc-icon-button gc-remove-btn"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#staticBackdropRemove"
                                                        onClick={() => setSelectedUserId(member.memberId)}
                                                    >
                                                        <span className="material-icons">remove_circle_outline</span>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="gc-empty-state">
                                        <span className="material-icons gc-empty-icon">people</span>
                                        <p>No students in this class yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ); // Chat is handled separately via overlay
            case 'materials':
                return (
                    <div className="gc-tab-content">
                        <MaterialsPage
                            courseId={courseId}
                            authToken={authToken}
                            adminId={adminId}
                            isMaterialsOpen={isMaterialsOpen}
                            toggleMaterials={toggleMaterials}
                        />
                    </div>
                ); // Materials is handled separately via overlay
            case 'quizzes':
                return (
                    <div className="gc-tab-content">
                        <Quiz
                            authToken={authToken}
                            adminId={adminId}
                            admin={admin}
                            courseId={courseId}
                            courseName={courseName}
                            setQuizId={setQuizId}
                            quizTitle={quizTitle}
                            setQuizTitle={setQuizTitle}
                        />
                    </div>
                );
            default:
                return (
                    <div className="gc-empty-state">
                        <span className="material-icons gc-empty-icon">info</span>
                        <p>Select a tab to view content</p>
                    </div>
                );
        }
    };

    return (
        <div className="gc-course-details-container">
            {/* Course Banner */}
            <div className="gc-course-banner">
                <div className="gc-course-banner-content">
                    <h1 className="gc-course-title">{courseName}</h1>
                    <p className="gc-course-section">{description}</p>
                    <p className="gc-course-admin">Instructor: {admin}</p>
                </div>
                <div className="gc-course-actions">
                    <NavLink to="/courses" className="gc-button gc-button-text" style={{ color: 'black' }}>
                        <span className="material-icons">arrow_back</span>
                        Back
                    </NavLink>

                    {isAdmin ? (
                        <div className="gc-action-group">
                            <button
                                className="gc-button gc-button-text"
                                data-bs-toggle="modal"
                                data-bs-target="#exampleModal"
                                style={{ color: 'black' }}
                            >
                                <span className="material-icons">delete</span>
                                Delete
                            </button>
                            <button
                                className="gc-button gc-button-text"
                                data-bs-toggle="modal"
                                data-bs-target="#updateCourseModal"
                                style={{ color: 'black' }}
                            >
                                <span className="material-icons">edit</span>
                                Edit
                            </button>
                        </div>
                    ) : (
                        <button
                            className="gc-button gc-button-text gc-danger-button"
                            data-bs-toggle="modal"
                            data-bs-target="#leaveModal"
                            style={{ color: 'black' }}
                        >
                            <span className="material-icons">exit_to_app</span>
                            Leave
                        </button>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="gc-tabs-container">
                <div className="gc-tab-list">
                    <div
                        className={`gc-tab-item ${activeTab === 'chat' ? 'active' : ''}`}
                        onClick={toggleChat}
                    >
                        Chats
                    </div>
                    <div
                        className={`gc-tab-item ${activeTab === 'assignments' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('assignments');
                            setIsChatOpen(false);
                            setIsMaterialsOpen(false);
                        }}
                    >
                        Assignments
                    </div>
                    <div
                        className={`gc-tab-item ${activeTab === 'materials' ? 'active' : ''}`}
                        onClick={toggleMaterials}
                    >
                        Materials
                    </div>
                    <div
                        className={`gc-tab-item ${activeTab === 'quizzes' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('quizzes');
                            setIsChatOpen(false);
                            setIsMaterialsOpen(false);
                        }}
                    >
                        Quizzes
                    </div>
                    {/* <NavLink to="/quiz" className="gc-tab-item">
                        Quizzes
                    </NavLink> */}
                    <NavLink to="http://localhost:3001" target="_blank" className="gc-tab-item">
                        Meetings
                    </NavLink>
                    <div
                        className={`gc-tab-item ${activeTab === 'people' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('people');
                            setIsChatOpen(false);
                            setIsMaterialsOpen(false);
                        }}
                    >
                        People
                    </div>
                </div>
            </div>

            {/* Course Content */}
            <div className="gc-content-container">
                {renderContent()}
            </div>

            {/* Course Actions */}
            <div className="gc-course-actions">
                <NavLink to="/courses" className="gc-button gc-button-text">
                    <span className="material-icons">arrow_back</span>
                    Back to Courses
                </NavLink>

                {isAdmin ? (
                    <div className="gc-action-group">
                        <button
                            className="gc-button gc-button-text"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                        >
                            <span className="material-icons">delete</span>
                            Delete Course
                        </button>
                        <button
                            className="gc-button gc-button-text"
                            data-bs-toggle="modal"
                            data-bs-target="#updateCourseModal"
                        >
                            <span className="material-icons">edit</span>
                            Edit Course
                        </button>
                    </div>
                ) : (
                    <button
                        className="gc-button gc-button-text gc-danger-button"
                        data-bs-toggle="modal"
                        data-bs-target="#leaveModal"
                    >
                        <span className="material-icons">exit_to_app</span>
                        Leave Course
                    </button>
                )}
            </div>

            {/* Chat Overlay */}
            <div className={`gc-chat-overlay ${isChatOpen ? 'open' : ''}`} >
                <div className="gc-chat-content">
                    <div className="gc-chat-header">
                        <h2 className="gc-chat-title">Chats</h2>
                        <button className="gc-icon-button gc-close-btn" onClick={toggleChat}>
                            <span className="material-icons">close</span>
                        </button>
                    </div>

                    <div className="gc-chat-body" ref={chatBodyRef}>
                        {error ? (
                            <div className="gc-error">Failed to load chats: {error}</div>
                        ) : chats === null ? (
                            <div className="gc-loading">
                                <span className="material-icons gc-loading-icon">sync</span>
                                <p>Loading chats...</p>
                            </div>
                        ) : chats.length > 0 ? (
                            <div className="gc-messages-list">
                                {chats.map((chat) => (
                                    <div key={chat.chatId} className="gc-chat-item" title={formatSentTime(chat.sentAt)}>
                                        <div className="gc-chat-header">
                                            <span className="gc-sender-name">{chat.senderName || "Bot"}</span>
                                        </div>
                                        <div className="gc-message gc-incoming">
                                            <p>{chat.message || "No message content"}</p>
                                            {chat.fileName && (
                                                <div className="gc-chat-file">
                                                    <span className="gc-file-label">File:</span>
                                                    <button
                                                        onClick={() => handleDownloadFile(chat.fileName)}
                                                        className="gc-download-button"
                                                    >
                                                        {chat.fileName}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="gc-empty-chat">
                                <span className="material-icons gc-empty-icon">forum</span>
                                <p>No chats yet. Start a conversation!</p>
                            </div>
                        )}
                    </div>

                    <div className="gc-chat-footer">
                        <form onSubmit={handleSendMessage} className="gc-chat-form">
                            <label htmlFor="file-upload" className="gc-file-icon" title="Upload a file">
                                {file ? (
                                    <span className="material-icons gc-success-icon">check_circle</span>
                                ) : (
                                    <span className="material-icons">attach_file</span>
                                )}
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                className="gc-hidden"
                                onChange={handleFileChange}
                            />
                            <input
                                type="text"
                                className="gc-message-input"
                                placeholder="Type a message..."
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                            />
                            <button type="submit" className="gc-send-button">
                                <span className="material-icons">send</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Materials Overlay */}
            {/* <MaterialsOverlay
                courseId={courseId}
                authToken={authToken}
                adminId={adminId}
                isMaterialsOpen={isMaterialsOpen}
                toggleMaterials={toggleMaterials}
            /> */}


            {/* Add Member Modal */}
            <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content gc-modal">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">Invite students</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form className="gc-search-form" onSubmit={handleSearchUser}>
                                <div className="gc-search-input-container">
                                    <span className="material-icons gc-search-icon">search</span>
                                    <input
                                        className="gc-search-input"
                                        onChange={(e) => (setSearchUserName(e.target.value), setSearchUsernameResults(''))}
                                        type="search"
                                        placeholder="Search for users"
                                        value={searchUserName}
                                    />
                                </div>
                                <button className="gc-button gc-button-contained" type="submit">Search</button>
                            </form>

                            {searchUserNameResults.length > 0 ? (
                                <ul className="gc-search-results">
                                    {searchUserNameResults.map((user) => (
                                        <li
                                            key={user.id}
                                            className={`gc-search-result-item ${selectedUserId === user.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedUserId(user.id)}
                                        >
                                            <div className="gc-person-avatar">{user.userName.charAt(0)}</div>
                                            <div className="gc-person-name">{user.userName}</div>
                                            {selectedUserId === user.id && (
                                                <span className="material-icons gc-check-icon">check_circle</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                searchUserName && (
                                    <div className="gc-empty-search">
                                        <p>No matching users found</p>
                                    </div>
                                )
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="gc-button gc-button-text" data-bs-dismiss="modal">Cancel</button>
                            <button
                                type="button"
                                disabled={!selectedUserId}
                                onClick={handleAddUser}
                                className="gc-button gc-button-contained"
                                data-bs-dismiss="modal"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Remove Member Modal */}
            <div className="modal fade" id="staticBackdropRemove" aria-labelledby="removeModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content gc-modal">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="removeModalLabel">Remove student</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to remove this student from {courseName}?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="gc-button gc-button-text" data-bs-dismiss="modal">Cancel</button>
                            <button
                                type="button"
                                onClick={handleRemoveUser}
                                className="gc-button gc-button-contained gc-button-danger"
                                data-bs-dismiss="modal"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Update Course Modal */}
            <div className="modal fade" id="updateCourseModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="updateCourseModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content gc-modal">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="updateCourseModalLabel">Update Course</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <UpdateCourse
                                authToken={authToken}
                                courseId={courseId}
                                courseName={courseName}
                                setCourseName={setCourseName}
                                description={description}
                                setDescription={setDescription}
                                setLoading={setLoading}
                                adminId={adminId}
                                admin={admin}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Course Modal */}
            <div className="modal fade" id="exampleModal" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content gc-modal">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Delete course</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to delete <strong>{courseName}</strong>? This action cannot be undone.
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="gc-button gc-button-text" data-bs-dismiss="modal">Cancel</button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="gc-button gc-button-contained gc-button-danger"
                                data-bs-dismiss="modal"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leave Course Modal */}
            <div className="modal fade" id="leaveModal" aria-labelledby="leaveModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content gc-modal">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="leaveModalLabel">Leave course</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to leave <strong>{courseName}</strong>?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="gc-button gc-button-text" data-bs-dismiss="modal">Cancel</button>
                            <button
                                type="button"
                                onClick={handleLeaveCourse}
                                className="gc-button gc-button-contained gc-button-danger"
                                data-bs-dismiss="modal"
                            >
                                Leave
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseDetails;