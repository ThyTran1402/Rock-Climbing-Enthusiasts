import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 