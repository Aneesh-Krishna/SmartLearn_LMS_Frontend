import { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import "../styles/CourseChats.css";
import { HubConnectionBuilder } from "@microsoft/signalr";

function CourseChats({ authToken, adminId, courseId, courseName }) {
  const [chats, setChats] = useState(null);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const chatBodyRef = useRef(null);
  const connectionRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const formatSentTime = (sentTime) => {
    const date = new Date(sentTime);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const fetchAllChats = async () => {
    try {
      const response = await fetch(
        `http://localhost:5116/api/chat/${courseId}/GetAllChats`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

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

      const response = await fetch(
        `http://localhost:5116/api/chat/${courseId}/SendMessage`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: form,
        }
      );

      if (response.ok) {
        setChatMessage("");
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
    connectionRef.current = new HubConnectionBuilder()
      .withUrl(`http://localhost:5116/chatHub`)
      .build();

    connectionRef.current
      .start()
      .then(() => {
        console.log("SignalR connected");
        connectionRef.current.invoke("JoinGroup", courseId.toString());
        connectionRef.current.on("ReceiveMessage", (newMessage) => {
          console.log("Message received..!");
          console.log(newMessage);
          setChats((prevChats) => {
            const exists = prevChats.some((chat) => chat.chatId === newMessage.chatId);
            return exists ? prevChats : [...prevChats, newMessage];
          });
        });
      })
      .catch((err) => console.log("Error starting SignalR connection: ", err));

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chats, refreshTrigger]);

  return (
    <div className="chat-container">
      <div className="chat-card">
        <div className="chat-header">
          <NavLink to="/courseDetails" className="header-back-link">
            <span className="header-back-icon">◄</span>
            <h2 className="chat-title">{courseName}</h2>
          </NavLink>
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
                <div
                  key={chat.chatId}
                  className="chat-item"
                  title={formatSentTime(chat.sentAt)}
                >
                  <div className="chat-header-info">
                    <span className="sender-name">{chat.senderName || "Unknown"}</span>
                    <span className="sent-time">{formatSentTime(chat.sentAt)}</span>
                  </div>
                  <div className="message incoming">
                    <p>{chat.message || "No message content"}</p>
                    {chat.fileName && (
                      <div className="chat-file">
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
            <div
              className={`file-input-area ${isDragging ? "dragover" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <label htmlFor="file-upload" className="file-icon" title="Upload a file">
                {file ? (
                  <span className="attach-symbol">📎</span>
                ) : (
                  <span className="attach-symbol">📎</span>
                )}
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
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