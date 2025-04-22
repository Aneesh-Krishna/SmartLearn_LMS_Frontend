import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Login.css';


function Login({ setAuthToken, setShowRegister }) {
  document.title = 'Login: SmartLearn_LMS';

  const [formData, setFormData] = useState({
    userName: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Password validation regex
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!passwordRegex.test(formData.password)) {
      setError(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 6 characters long.'
      );
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5116/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
        localStorage.setItem('authToken', data.token);
        <NavLink to="/courses" />;
      } else {
        const errorData = await response.json();
        setError(errorData);
      }
    } catch (error) {
      setError('Invalid username or password');
      console.error('Error during login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <body className='login-page'>
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <div className="icon-container">
              <span className="login-icon">🔒</span>
            </div>
            <h2>Welcome back</h2>
            <p>Please enter your details to sign in</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="userName">Username</label>
              <input
                id="userName"
                name="userName"
                type="text"
                required
                value={formData.userName}
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={isLoading} className="submit-button">
              {isLoading ? 'Loading...' : 'Sign in'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Not a member?{' '}
              <button onClick={() => setShowRegister(true)} className="register-link">
                Register now
              </button>
            </p>
          </div>
        </div>
      </div>
    </body>
  );
}

export default Login;
