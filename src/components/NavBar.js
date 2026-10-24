import React, { useState, useEffect, useRef } from 'react';

const links = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'events', label: 'Events' },
  { key: 'attendees', label: 'Attendees' },
];

export default function NavBar({ current, onNavigate, user }) {
  const [open, setOpen] = useState(false); // mobile collapse
  const [menuOpen, setMenuOpen] = useState(false); // user dropdown
  const menuRef = useRef(null);

  // Close the user dropdown when clicking elsewhere or pressing Escape.
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

  const go = key => {
    onNavigate(key);
    setOpen(false);
    setMenuOpen(false);
  };

  const initials = user.name
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark ems-nav">
      <div className="container">
        <button className="navbar-brand ems-brand btn btn-link" onClick={() => go('dashboard')}>
          <span className="ems-brand-mark" aria-hidden="true" />
          Eventide
        </button>

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
            {links.map(l => (
              <li key={l.key} className={`nav-item ${current === l.key ? 'active' : ''}`}>
                <button
                  className="nav-link btn btn-link"
                  aria-current={current === l.key ? 'page' : undefined}
                  onClick={() => go(l.key)}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>

          <button className="btn ems-btn-accent mr-lg-3 my-2 my-lg-0" onClick={() => go('create')}>
            Create event
          </button>

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
                <span className="ems-user-role">{user.role}</span>
              </span>
            </button>
            <div className={`dropdown-menu dropdown-menu-right ${menuOpen ? 'show' : ''}`}>
              <button className="dropdown-item" onClick={() => go('profile')}>Your profile</button>
              <button className="dropdown-item" onClick={() => go('settings')}>Settings</button>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={() => alert('Sign out will be wired up with the API.')}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}