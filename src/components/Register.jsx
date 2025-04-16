import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

function Register({ setShowRegister }) {
    document.title = 'Register: SmartLearn_LMS';

    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Password validation regex
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

        if (!passwordRegex.test(formData.password)) {
            alert(
                'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 6 characters long.'
            );
            return;
        }

        try {
            const response = await fetch('http://localhost:5116/api/account/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            if (response.ok) {
                setShowRegister(false);
            } else {
                const errorData = await response.json();
                alert('Error: ' + errorData);
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    return (
        <body className='register-page'>
            <div className="register-container">
                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="register-header">
                        <h2>Register</h2>
                        <p>Signup now and get full access to our app.</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor='fullName'>  Full Name</label>

                        <input
                            id='fullName'
                            className="form-control"
                            name="fullName"
                            type="text"
                            onChange={handleChange}
                            value={formData.fullName}
                            placeholder="Enter your full name"
                            required
                        />

                    </div>

                    <div className="form-group">
                        <label htmlFor='userName'>
                            Username  </label>
                        <input
                            id='userName'
                            className="form-control"
                            name="userName"
                            type="text"
                            onChange={handleChange}
                            value={formData.userName}
                            placeholder="Enter your username"
                            required
                        />

                    </div>

                    <div className="form-group">
                        <label htmlFor='Email'>
                            Email</label>
                        <input
                            id='email'
                            className="form-control"
                            name="email"
                            type="email"
                            onChange={handleChange}
                            value={formData.email}
                            placeholder="Enter your email"
                            required
                        />

                    </div>

                    <div className="form-group">
                        <label>
                            Password </label>
                        <input
                            id="password"
                            className="form-control"
                            name="password"
                            type="password"
                            onChange={handleChange}
                            value={formData.password}
                            placeholder="••••••••"
                            required
                        />

                    </div>

                    <button className="submit-button" type="submit">
                        Submit
                    </button>

                    <p className="register-footer">
                        Already have an account?{' '}
                        <button
                            type="button"
                            className="signin-button"
                            onClick={() => setShowRegister(false)}
                        >
                            Sign in
                        </button>
                    </p>
                </form>
            </div>
        </body>
    );
}

export default Register;
