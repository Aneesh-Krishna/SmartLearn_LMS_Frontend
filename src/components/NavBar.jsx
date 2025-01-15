import React, { useContext, useEffect } from "react";
import { NavLink } from "react-router-dom";
// import { AppContext } from "../services/AppContext";

function NavBar({authToken, setCourseId, setCourseName, setAdmin, setAdminId, setDescription, courses }) {
    // const {
    //     setCourseId,
    //     setCourseName,
    //     setAdmin,
    //     setAdminId,
    //     setDescription,
    //     courses
    // } = useContext(AppContext);

    useEffect(() => {

    }, [courses])

    return (
        <nav className="navbar bg-body-tertiary fixed-top">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">ClassroomApp</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
                </button>
                <div className="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="offcanvasNavbarLabel">ClassroomApp</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                        <li key="home" className="nav-item">
                            <NavLink to="/courses" className="nav-link active" aria-current="page">Home</NavLink>
                        </li>
                        <li key="about" className="nav-item">
                            <NavLink to="/courses" className="nav-link">Link</NavLink>
                        </li>
                        <li key="courses" className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Courses
                            </a>
                            <ul className="dropdown-menu">
                                {courses.length > 0 ? 
                                    (courses.map((course) => (
                                        <li key={course.courseId}>
                                            <NavLink 
                                                to="/courseDetails" 
                                                onClick={() => (
                                                    setCourseId(course.courseId), 
                                                    setCourseName(course.courseName), 
                                                    setAdmin(course.admin), 
                                                    setAdminId(course.adminId), 
                                                    setDescription(course.description)
                                                )} 
                                                className="dropdown-item"
                                            >
                                                {course.courseName}
                                            </NavLink>
                                        </li>
                                    ))
                                    ) : (
                                    <a className="dropdown-item" href="#">0 Courses</a>
                                    )
                                }
                            </ul>
                        </li>
                    </ul>
                </div>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
