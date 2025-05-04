import React, { useState, useCallback, memo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Home, BookOpen, Settings, ChevronDown, LogOut, SortAsc, Library, FileText } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

// Extracted menu items for better maintainability
const MENU_ITEMS = [
  { path: '/home', icon: <Home size={20} />, label: 'Home' },
  { path: '/courses', icon: <BookOpen size={20} />, label: 'Enrolled Courses' },
  { path: '/library', icon: <Library size={20} />, label: 'Library Materials' },
  { path: '/documentAnalysis', icon: <FileText size={20} />, label: 'Document Analysis' },
  { path: '/settings', icon: <Settings size={20} />, label: 'Settings' }
];

// Extracted sort options for better maintainability
const SORT_OPTIONS = [
  { value: 'courseName', label: 'Sort by Course Name' },
  { value: 'faculty', label: 'Sort by Faculty' }
];

// Memoized MenuItem component to prevent unnecessary re-renders
const MenuItem = memo(({ path, icon, label }) => (
  <NavLink
    to={path}
    className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
    end={path === '/home'}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
));

// UserAvatar component for reusability
const UserAvatar = ({ name, size = 'small' }) => (
  <div className={`avatar ${size === 'large' ? 'large' : ''}`}>
    {name?.charAt(0)?.toUpperCase() || '?'}
  </div>
);

const Navigation = ({ authToken, setAuthToken, onSort, userName, userEmail }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're on a page that needs sorting
  const isHomePage = location.pathname === '/home' || location.pathname === '/courses';

  // Memoized handlers to prevent unnecessary re-renders
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const toggleDropdown = useCallback(() => setIsDropdownOpen(prev => !prev), []);
  const toggleSortDropdown = useCallback(() => setIsSortDropdownOpen(prev => !prev), []);

  const handleLogout = useCallback(() => {
    navigate("/");
    setAuthToken(null);
    localStorage.removeItem("authToken");
  }, [navigate, setAuthToken]);

  const handleSort = useCallback((sortBy) => {
    onSort(sortBy);
    setIsSortDropdownOpen(false);
  }, [onSort]);

  // Close all dropdowns and menus
  const closeAll = useCallback(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    setIsSortDropdownOpen(false);
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="nav-start">
          <button
            className="menu-button"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
          <NavLink to="/" className="nav-logo">
            <h1>Smart-Learn</h1>
          </NavLink>
        </div>

        {isHomePage && (
          <div className="nav-center">
            <div className="sort-dropdown">
              <button
                className="sort-button"
                onClick={toggleSortDropdown}
                aria-expanded={isSortDropdownOpen}
                aria-haspopup="true"
              >
                <SortAsc size={20} />
                <span>Sort</span>
                <ChevronDown size={16} />
              </button>

              {isSortDropdownOpen && (
                <div className="sort-menu" role="menu">
                  {SORT_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      className="sort-option"
                      onClick={() => handleSort(option.value)}
                      role="menuitem"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="nav-end">
          <div
            className="user-profile"
            onClick={toggleDropdown}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <UserAvatar name={userName} />
            <ChevronDown size={20} />
          </div>
        </div>
      </nav>

      {/* Vertical Side Menu */}
      <aside
        className={`side-menu ${isMenuOpen ? 'open' : ''}`}
        onMouseLeave={toggleMenu}
        aria-hidden={!isMenuOpen}
      >
        {MENU_ITEMS.map(item => (
          <MenuItem key={item.path} {...item} />
        ))}
      </aside>

      {/* User Dropdown */}
      {isDropdownOpen && (
        <div className="user-dropdown" role="dialog" aria-label="User profile">
          <div className="dropdown-header">
            <UserAvatar name={userName} size="large" />
            <div className="user-info">
              <h4>{userName || 'User'}</h4>
              <p>{userEmail || 'No email'}</p>
            </div>
          </div>
          <div className="dropdown-divider" />
          <button onClick={handleLogout} className="dropdown-item">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      )}

      {/* Overlay for closing menus */}
      {(isMenuOpen || isDropdownOpen || isSortDropdownOpen) && (
        <div
          className="overlay"
          onClick={closeAll}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default memo(Navigation);