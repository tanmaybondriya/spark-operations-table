// components/Header.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../authContext.jsx";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          <h1 className="ml-2 text-lg font-semibold text-gray-800">ParkMate</h1>
        </div>

        <div className="flex items-center ml-auto">
          <button className="relative">
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              ></path>
            </svg>
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
              2
            </span>
          </button>

          <div className="ml-4 relative">
            <div>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center focus:outline-none"
              >
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"
                  alt="Profile"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                  {user?.name || "Admin"}
                </span>
                <svg
                  className="ml-1 h-5 w-5 text-gray-400 hidden md:block"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {userMenuOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-800 text-white">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `block py-3 px-4 ${
                isActive ? "bg-blue-700" : "hover:bg-blue-700"
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/table"
            className={({ isActive }) =>
              `block py-3 px-4 ${
                isActive ? "bg-blue-700" : "hover:bg-blue-700"
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Bookings Table
          </NavLink>
        </div>
      )}
    </header>
  );
};

export default Header;
