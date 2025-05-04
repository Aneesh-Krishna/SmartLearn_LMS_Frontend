import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import '../styles/CreateCourse.css'; // Import the CSS file

function UpdateCourse({ authToken, courseId, courseName, setCourseName, description, setDescription, setLoading, adminId, admin }) {
    document.title = 'Update-Course: SmartLearn_LMS';

    const [formData, setFormData] = useState({
        courseName: courseName,
        description: description,
    })

    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const form = new FormData();
            form.append('courseName', formData.courseName);
            form.append('description', formData.description);
            const response = await fetch(`http://localhost:5116/api/course/${courseId}/UpdateCourse`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: form,
                credentials: 'include',
            });

            if (response.ok) {
                // Update the parent state and close the modal
                setCourseName(formData.courseName);
                setDescription(formData.description);
                navigate("/courseDetails");
                // Close the modal using Bootstrap's JavaScript
                document.getElementById('closeUpdateModal').click();
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to update the course.');
            }
        } catch (error) {
            setError('Error updating the course.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-course-container" style={{ marginTop: 0 }}>
            <h3 className="create-course-heading">Update Course</h3>
            {error && <div className="alert alert-danger">{error}</div>}

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
                <div className="d-flex justify-content-end gap-2 mt-3">
                    <button
                        type="button"
                        className="gc-button gc-button-text"
                        data-bs-dismiss="modal"
                        id="closeUpdateModal"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="gc-button gc-button-contained">Update</button>
                </div>
            </form>
        </div>
    );
}

export default UpdateCourse;