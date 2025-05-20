// authContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

// Create auth context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("parkingAppUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function with static credential check
  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      // Static credential verification
      if (email === "spark_admin@spark.com" && password === "SparkMachineries@2024") {
        const userData = { email, name: "Admin", role: "admin" };
        setUser(userData);
        localStorage.setItem("parkingAppUser", JSON.stringify(userData));
        resolve(userData);
      } else {
        reject(new Error("Invalid email or password"));
      }
    });
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("parkingAppUser");
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;