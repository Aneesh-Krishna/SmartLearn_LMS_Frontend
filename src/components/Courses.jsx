import React, { useEffect, useState } from 'react';
import Spinner from './Loading';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../styles/Courses.css';

function Courses({ authToken, setCourseId, setCourseName, setAdmin, setAdminId, setDescription, setAuthToken, sortBy }) {
    document.title = 'Courses: SmartLearn_LMS';
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5116/api/course', {
                method: 'GET',
                headers: { Authorization: `Bearer ${authToken}` }
            });

            if (response.ok) {
                const data = await response.json();
                let fetchedCourses = data?.$values || [];

                // Apply sorting based on selected criteria
                if (sortBy === 'courseName') {
                    fetchedCourses.sort((a, b) => a.courseName.localeCompare(b.courseName));
                } else if (sortBy === 'faculty') {
                    fetchedCourses.sort((a, b) => a.admin.localeCompare(b.admin));
                }

                setCourses(fetchedCourses);
            } else {
                console.error('Failed to fetch courses:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [authToken, sortBy]); // Refetch when sorting changes

    return (
        <div className="courses-container" style={{ marginTop: 50 }}>
            <h3 className="text-center">Your Courses</h3>
            <NavLink to="/createCourse"
                className="create-course-link"
                onClick={() => setAuthToken(authToken)}
            >
                Create new course
            </NavLink>

            {loading ? <Spinner /> : null}

            {courses.length <= 0 ? <p><b>You've not enrolled in any courses!</b></p> : null}
            <div className="courses-grid">
                {courses.map((course) => (
                    <div className="course-card" key={course.courseId}>
                        <div className="course-card-header">
                            <h4>{course.courseName}</h4>
                            <p className="course-admin">Instructor: {course.admin}</p>
                        </div>
                        <div className="course-card-body">
                            <p>{course.description}</p>
                        </div>
                        <div className="course-card-footer">
                            <NavLink
                                to="/courseChats"
                                className="details-link"
                                onClick={() => {
                                    setCourseId(course.courseId);
                                    setCourseName(course.courseName);
                                    setAdmin(course.admin);
                                    setAdminId(course.adminId);
                                    setDescription(course.description);
                                    setAuthToken(authToken);
                                }}
                            >
                                Chats
                            </NavLink>
                        </div>
                        <div className="course-card-footer">
                            <NavLink
                                to="/courseDetails"
                                className="details-link"
                                onClick={() => {
                                    setCourseId(course.courseId);
                                    setCourseName(course.courseName);
                                    setAdmin(course.admin);
                                    setAdminId(course.adminId);
                                    setDescription(course.description);
                                    setAuthToken(authToken);
                                }}
                            >
                                View Details
                            </NavLink>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Courses;
