import React, { createContext, useState, useContext } from "react";

// Create Context
const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
    const [authContextToken, setAuthContextToken] = useState(null);

    return (
        <AuthContext.Provider value={{ authContextToken, setAuthContextToken }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use auth context
export const useAuth = () => {
    return useContext(AuthContext);
};
