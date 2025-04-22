import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

function SettingsPage({ authToken }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        userName: "",
        fullName: "",
        phoneNumber: ""
    });
    const [updateSuccess, setUpdateSuccess] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!authToken) {
                setError("Authentication token is missing");
                setLoading(false);
                return;
            }

            try {
                const decodedToken = jwtDecode(authToken);
                const userId = decodedToken.sub;

                const response = await fetch(`http://localhost:5116/api/Account/${userId}/details`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                });

                const data = await response.json(); // Parse response manually

                let userData = null;

                // Check for $values format
                if (data && data.$values && data.$values.length > 0) {
                    userData = data.$values[0];
                } else if (Array.isArray(data) && data.length > 0) {
                    userData = data[0];
                } else {
                    throw new Error("Unexpected response format or no user data found");
                }

                setUser(userData);
                setFormData({
                    userName: userData.userName || "",
                    fullName: userData.fullName || "",
                    phoneNumber: userData.phoneNumber || ""
                });

                setLoading(false);
            } catch (err) {
                setError(`Failed to fetch user details: ${err.message}`);
                console.error("Error fetching user details:", err);
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [authToken]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateSuccess(false);

        try {
            const response = await fetch("http://localhost:5116/api/Account/editProfile", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData),
            }
            );

            // Update the user state with the updated data
            if (response.ok) {
                setUser({
                    ...user,
                    userName: formData.userName,
                    fullName: formData.fullName,
                    phoneNumber: formData.phoneNumber
                });

                setEditing(false);
                setUpdateSuccess(true);
            }
            else {
                console.error("An error occured while updating the profile...", response.text);
            }
            setTimeout(() => {
                setUpdateSuccess(false);
            }, 3000);
        } catch (err) {
            setError(`Failed to update profile: ${err.message}`);
            console.error("Error updating profile:", err);
        }
    };

    // Display loading state
    if (loading) {
        return (
            <div className="settings-page">
                <h2>User Settings</h2>
                <p>Loading user details...</p>
            </div>
        );
    }

    // Display error state
    if (error) {
        return (
            <div className="settings-page">
                <h2>User Settings</h2>
                <div className="error-message">Error: {error}</div>
            </div>
        );
    }

    // Display when no user data is available
    if (!user) {
        return (
            <div className="settings-page">
                <h2>User Settings</h2>
                <p>No user data available. Please check your authentication.</p>
            </div>
        );
    }

    // Main render with user data
    return (
        <div className="settings-page">
            <h2>User Settings</h2>

            {updateSuccess && (
                <div className="success-message">Profile updated successfully!</div>
            )}

            {!editing ? (
                <div className="user-details">
                    <div className="detail-item">
                        <span className="label">Username:</span>
                        <span className="value">{user.userName}</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">Full Name:</span>
                        <span className="value">{user.fullName}</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">Email:</span>
                        <span className="value">{user.email}</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">Phone Number:</span>
                        <span className="value">{user.phoneNumber || "Not set"}</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">Password:</span>
                        <span className="value">********</span>
                    </div>

                    <button
                        type="button"
                        className="edit-button"
                        onClick={() => setEditing(true)}
                    >
                        Edit Profile
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-group">
                        <label htmlFor="userName">Username:</label>
                        <input
                            type="text"
                            id="userName"
                            name="userName"
                            value={formData.userName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="fullName">Full Name:</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number:</label>
                        <input
                            type="text"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="disabled-input"
                        />
                        <small>Email cannot be changed</small>
                    </div>

                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            value="********"
                            disabled
                            className="disabled-input"
                        />
                        <small>Password cannot be changed here</small>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="save-button">Save Changes</button>
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => {
                                setEditing(false);
                                setFormData({
                                    userName: user.userName || "",
                                    fullName: user.fullName || "",
                                    phoneNumber: user.phoneNumber || ""
                                });
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Add some basic styling */}
            <style jsx>{`
        .settings-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h2 {
          margin-bottom: 20px;
          color: #333;
        }
        .user-details, .edit-form {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .detail-item {
          margin-bottom: 15px;
          display: flex;
        }
        .label {
          font-weight: bold;
          width: 150px;
        }
        .edit-button, .save-button {
          background: #4285f4;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 15px;
        }
        .cancel-button {
          background: #f44336;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin-left: 10px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        .form-group input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .disabled-input {
          background: #eee;
          cursor: not-allowed;
        }
        .success-message {
          background: #4caf50;
          color: white;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
        }
        .error-message {
          background: #f44336;
          color: white;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
        }
        small {
          color: #666;
          display: block;
          margin-top: 5px;
        }
      `}</style>
        </div>
    );
}

export default SettingsPage;