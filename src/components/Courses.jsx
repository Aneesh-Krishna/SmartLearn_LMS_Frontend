import React, { useEffect, useState, useMemo } from 'react';
import Spinner from './Loading';
import { NavLink } from 'react-router-dom';
import '../styles/Courses.css';

function Courses({ authToken, setCourseId, setCourseName, setAdmin, setAdminId, setDescription, setAuthToken, courses, setCourses }) {
  document.title = 'Courses: Assignment-App';
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://localhost:7110/api/course', {
        method: 'GET',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data?.$values || []);
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
  }, [authToken]);

  const filteredAndSortedCourses = useMemo(() => {
    return courses
      .filter(course =>
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.admin.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const compareValue = sortBy === 'name'
          ? a.courseName.localeCompare(b.courseName)
          : a.admin.localeCompare(b.admin);
        return sortOrder === 'asc' ? compareValue : -compareValue;
      });
  }, [courses, searchTerm, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="courses-container">
      <header className="courses-header">
        <h1 className="courses-title">Your Courses</h1>
        <NavLink to="/createCourse"
          className="create-course-link"
          onClick={() => setAuthToken(authToken)}
        >
          Create new course 
        </NavLink>
      </header>

      <div className="courses-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search courses or instructors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <i className="search-icon">🔍</i>
        </div>
        <div className="sort-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="instructor">Sort by Instructor</option>
          </select>
          <button onClick={toggleSortOrder} className="sort-order-button">
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {loading ? <Spinner /> : null}

      {filteredAndSortedCourses.length === 0 && !loading && (
        <p className="no-courses-message">No courses found. Try adjusting your search or create a new course!</p>
      )}

      <div className="courses-grid">
        {filteredAndSortedCourses.map((course) => (
          <div className="course-card" key={course.courseId}>
            <div className="course-card-header">
              <h2 className="course-name">{course.courseName}</h2>
              <p className="course-admin" style={{color: 'black'}}>Instructor: {course.admin}</p>
            </div>
            <div className="course-card-body">
              <p className="course-description" style={{color: 'black'}}>{course.description}</p>
            </div>
            <div className="course-card-footer">
              <NavLink
                to="/courseChats"
                className="course-link chat-link"
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
              <NavLink
                to="/courseDetails"
                className="course-link details-link"
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

