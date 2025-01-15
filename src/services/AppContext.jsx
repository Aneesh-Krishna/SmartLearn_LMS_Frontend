import React, { createContext, useState } from "react";

// Create the context
export const AppContext = createContext();

// Create the provider component
export const AppProvider = ({ children }) => {
    const [courseId, setCourseId] = useState(null);
    const [courseName, setCourseName] = useState("");
    const [admin, setAdmin] = useState(false);
    const [adminId, setAdminId] = useState(null);
    const [description, setDescription] = useState("");
    const [courses, setCourses] = useState([]);

    return (
        <AppContext.Provider value={{
            courseId,
            setCourseId,
            courseName,
            setCourseName,
            admin,
            setAdmin,
            adminId,
            setAdminId,
            description,
            setDescription,
            courses,
            setCourses
        }}>
            {children}
        </AppContext.Provider>
    );
};
