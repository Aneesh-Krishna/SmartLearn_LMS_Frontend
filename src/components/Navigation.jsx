import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, Home, BookOpen, Settings, ChevronDown, LogOut, SortAsc, Library } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navigation = ({ authToken, setAuthToken, onSort }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const isHomePage = location.pathname === '/home' || location.pathname === '/courses';

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5116/api/account/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        setAuthToken(null);
        navigate('/login');
      } else if (response.status === 401) {
        console.error('Unauthorized: Logging out due to expired session.');
        setAuthToken(null);
        navigate('/login');
      } else {
        console.error('Logout failed:', await response.text());
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSort = (sortBy) => {
    onSort(sortBy);
    setIsSortDropdownOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-start">
          <button
            className="menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>
          <NavLink to="/" className="nav-logo">
            <h1>Smart-Learn</h1>
          </NavLink>
        </div>

        {isHomePage &&
          <div className="nav-center">
            <div className="sort-dropdown">
              <button
                className="sort-button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              >
                <SortAsc size={20} />
                <span>Sort</span>
                <ChevronDown size={16} />
              </button>
              {isSortDropdownOpen && (
                <div className="sort-menu">
                  <button
                    className="sort-option"
                    onClick={() => handleSort('courseName')}
                  >
                    Sort by Course Name
                  </button>
                  <button
                    className="sort-option"
                    onClick={() => handleSort('faculty')}
                  >
                    Sort by Faculty
                  </button>
                </div>
              )}
            </div>
          </div>
        }

        <div className="nav-end">
          <div
            className="user-profile"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="avatar">JS</div>
            <ChevronDown size={20} />
          </div>
        </div>
      </nav>

      {/* Vertical Side Menu */}
      <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
        <NavLink
          to="/home"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          end
        >
          <Home size={20} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/courses"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          <BookOpen size={20} />
          <span>Enrolled Courses</span>
        </NavLink>

        <NavLink
          to="/library"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          <Library size={20} />
          <span>Library Materials</span>
        </NavLink>

        <NavLink
          to="/documentAnalysis"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          <span>Document analysis</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>

      {/* User Dropdown */}
      {isDropdownOpen && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <div className="avatar large">JS</div>
            <div className="user-info">
              <h4>John Smith</h4>
              <p>john.smith@example.com</p>
            </div>
          </div>
          <div className="dropdown-divider" />
          <button onClick={handleLogout} className="dropdown-item">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      )}

      {/* Overlay for mobile */}
      {(isMenuOpen || isDropdownOpen || isSortDropdownOpen) && (
        <div
          className="overlay"
          onClick={() => {
            setIsMenuOpen(false);
            setIsDropdownOpen(false);
            setIsSortDropdownOpen(false);
          }}
        />
      )}
    </>
  );
};

export default Navigation;