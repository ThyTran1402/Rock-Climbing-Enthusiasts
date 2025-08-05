import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onSignOut }) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <i className="fas fa-mountain"></i>
          <h1>Summit Seekers</h1>
        </div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/create" className="nav-link">Share Adventure</Link>
          {user ? (
            <div className="user-section">
              <span className="user-email">
                <i className="fas fa-user"></i>
                {user.email}
              </span>
              <button onClick={onSignOut} className="nav-btn sign-out-btn">
                <i className="fas fa-sign-out-alt"></i>
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/auth" className="nav-link auth-link">
              <i className="fas fa-sign-in-alt"></i>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 