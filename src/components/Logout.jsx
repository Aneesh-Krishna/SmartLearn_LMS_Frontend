import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Separate the logout logic into a standalone function
export const handleLogout = async (setAuthToken, navigate, authToken) => {
  if (!setAuthToken) {
    console.error('setAuthToken is undefined');
    return;
  }

  try {
    const response = await fetch('http://localhost:5116/api/account/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`, 
      },
      credentials: 'include',
    });

    if (response.ok) {
      setAuthToken(null); // Clear the token
      navigate('/login'); // Navigate to the login page
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to log out. Please try again.');
    }
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// The Logout component
function Logout({ setAuthToken }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onLogoutClick = async () => {
    setIsLoading(true);
    setError('');

    try {
      await handleLogout(setAuthToken, navigate);
    } catch (error) {
      setError('Error occurred during logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={onLogoutClick} disabled={isLoading}>
        {isLoading ? 'Logging out...' : 'Logout'}
      </button>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default Logout;