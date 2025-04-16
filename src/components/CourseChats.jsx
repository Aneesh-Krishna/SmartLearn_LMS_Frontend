import { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import '../styles/CourseChats.css';
import { HubConnectionBuilder } from "@microsoft/signalr";

function CourseChats({ authToken, adminId, courseId, courseName }) {
    const [chats, setChats] = useState(null);
    const [error, setError] = useState(null);
    const [file, setFile] = useState(null);
    const [chatMessage, setChatMessage] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const chatBodyRef = useRef(null);
    const connectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

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
                setChats(data?.$values || []); // Handle the array correctly
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

    useEffect(() => {
        fetchAllChats();
    }, [authToken, courseId, refreshTrigger]);

    useEffect(() => {
        // Initialize SignalR connection
        connectionRef.current = new HubConnectionBuilder()
            .withUrl(`http://localhost:5116/chatHub`)  // URL to your SignalR hub
            .build();

        connectionRef.current
            .start()
            .then(() => {
                console.log("SignalR connected");

                connectionRef.current.invoke("JoinGroup", courseId.toString());

                // Listen for new messages from SignalR
                connectionRef.current.on("ReceiveMessage", (newMessage) => {
                    console.log("Message received..!")
                    console.log(newMessage)
                    setChats(prevChats => {
                        const exists = prevChats.some(chat => chat.chatId === newMessage.chatId);
                        return exists ? prevChats : [...prevChats, newMessage];
                    });
                });
            })
            .catch(err => console.log("Error starting SignalR connection: ", err));

        // Clean up the SignalR connection when the component unmounts
        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop();
            }
        };
    }, []);

    useEffect(() => {
        // Scroll to the bottom of the chat body whenever new chats are added or sent
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [chats, refreshTrigger]); // Runs when chats or refreshTrigger change

    useEffect(() => {
        // After the component mounts and layout stabilizes, show the button smoothly
        const timeout = setTimeout(() => {
          setIsVisible(true); // Make button visible after 1 second
        }, 500); // Wait for 1 second
    
        // Cleanup the timeout if the component unmounts
        return () => clearTimeout(timeout);
      }, []);
    return (
        <div className="chat-container">
            <NavLink to="/courses" className={`btn-outline-primary ${isVisible ? "show" : "hidden"}`}>
                ◄ Back to Courses
            </NavLink>
            
            <div className="chat-card">
                <div className="chat-header">
                    <h2 className="chat-title">{courseName}</h2>
                </div>
                
                <div className="chat-body" ref={chatBodyRef}>
                    {error ? (
                        <div className="error">Failed to load chats: {error}</div>
                    ) : chats === null ? (
                        <div className="message incoming">
                            <p>Loading chats...</p>
                        </div>
                    ) : chats.length > 0 ? (
                        <div className="messages-list">
                            {chats.map((chat) => (
                                <div key={chat.chatId} className="chatItem" title={formatSentTime(chat.sentAt)}>
                                    <div className="chatHeader">
                                        <span className="sender-name">{chat.senderName || "Unknown"}</span>
                                    </div>
                                    <div className="message incoming">
                                        <p>{chat.message || "No message content"}</p>
                                        {chat.fileName && (
                                            <div className="chatFile">
                                                <span className="file-label">File:</span>
                                                <button 
                                                    onClick={() => handleDownloadFile(chat.fileName)}
                                                    className="download-button"
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
                        <div className="message incoming">
                            <p>No chats yet. Start a conversation!</p>
                        </div>
                    )}
                </div>

                <div className="chat-footer">
                    <form onSubmit={handleSendMessage} className="chat-form">
                        <label htmlFor="file-upload" className="file-icon" title="Upload a file">
                            {file ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon-success" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon-upload" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            )}
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <input
                            type="text"
                            className="message-control"
                            placeholder="Type a message..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                        />
                        <button type="submit" className="send-button">
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CourseChats;
