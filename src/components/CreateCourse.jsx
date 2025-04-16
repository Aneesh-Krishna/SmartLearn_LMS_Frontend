import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import '../styles/CreateCourse.css'; // Import the CSS file

function CreateCourse({ authToken, setLoading }) {
    document.title = 'Create-course: SmartLearn_LMS';

    const [formData, setFormData] = useState({
        courseName: '',
        description: '',
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const form = new FormData();
            form.append('courseName', formData.courseName);
            form.append('description', formData.description);
            const response = await fetch('http://localhost:5116/api/course/Create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: form,
                credentials: 'include',
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => navigate('/courses'), 1000); // Redirect after success
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to create the course.');
            }
        } catch (error) {
            setError('Error creating the course.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1 className="dashboard-title">Create a New Course</h1>
            </header>
            <main className="dashboard-main">
                <div className="create-course-card">
                    <h3 className="create-course-heading">Add New Course</h3>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">Course created successfully!</div>}

                    <form onSubmit={handleSubmit} className="create-course-form">
                        <input
                            type="text"
                            name="courseName"
                            placeholder="Course Name"
                            value={formData.courseName}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                        <input
                            type="text"
                            name="description"
                            placeholder="Description"
                            value={formData.description}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                        <button type="submit" className="submit-btn">Create</button>
                    </form>
                    <NavLink to="/courses" className="return-link">Back to Courses</NavLink>
                </div>
            </main>
        </div>
    );
}

export default CreateCourse;
