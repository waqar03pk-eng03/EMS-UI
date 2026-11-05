import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function NavBar() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false); // mobile collapse
  const [menuOpen, setMenuOpen] = useState(false); // user dropdown
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close menus whenever the page changes.
  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Close the user dropdown on outside click or Escape.
  useEffect(() => {
    const onClick = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = e => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user
    ? user.name.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : '';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark ems-nav">
      <div className="container">
        <Link className="navbar-brand ems-brand" to="/">
          <span className="ems-brand-mark" aria-hidden="true" />
          Eventide
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="ems-nav-links"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="ems-nav-links">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item"><NavLink end to="/" className="nav-link">Home</NavLink></li>
            <li className="nav-item"><NavLink to="/about" className="nav-link">About</NavLink></li>
            <li className="nav-item"><NavLink to="/events" className="nav-link">Events</NavLink></li>
            {user && (
              <li className="nav-item"><NavLink to="/create-event" className="nav-link">Create event</NavLink></li>
            )}
            {isAdmin && (
              <>
                <li className="nav-item"><NavLink to="/categories" className="nav-link">Categories</NavLink></li>
                <li className="nav-item"><NavLink to="/manage-events" className="nav-link">Events Management</NavLink></li>
              </>
            )}
          </ul>

          {user ? (
            <div className="dropdown ems-user" ref={menuRef}>
              <button
                className="btn ems-user-toggle"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="ems-avatar">{initials}</span>
                <span className="ems-user-text">
                  <span className="ems-user-name">{user.name}</span>
                  <span className="ems-user-role">{isAdmin ? 'Administrator' : 'Member'}</span>
                </span>
              </button>
              <div className={`dropdown-menu dropdown-menu-right ${menuOpen ? 'show' : ''}`}>
                <span className="dropdown-item-text text-muted small">{user.email}</span>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={handleLogout}>Log out</button>
              </div>
            </div>
          ) : (
            <ul className="navbar-nav align-items-lg-center">
              <li className="nav-item"><NavLink to="/login" className="nav-link">Log in</NavLink></li>
              <li className="nav-item ml-lg-2 my-2 my-lg-0">
                <Link to="/register" className="btn ems-btn-accent">Register</Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}
