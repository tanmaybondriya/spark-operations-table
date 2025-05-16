// components/Header.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex items-center md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <h1 className="ml-2 text-lg font-semibold text-gray-800">ParkMate</h1>
        </div>
        
        <div className="flex items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-100 rounded-lg py-2 px-4 pl-10 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <button className="ml-4 relative">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">3</span>
          </button>
          
          <div className="ml-4 flex items-center">
            <img
              className="h-8 w-8 rounded-full object-cover"
              src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"
              alt="Profile"
            />
            <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">Admin</span>
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
              `block py-3 px-4 ${isActive ? 'bg-blue-700' : 'hover:bg-blue-700'}`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/table" 
            className={({ isActive }) => 
              `block py-3 px-4 ${isActive ? 'bg-blue-700' : 'hover:bg-blue-700'}`
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