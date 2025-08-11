import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import './Navbar.css';

const Navbar = () => {
  const { user, signOut } = useUser();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = () => {
    signOut();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <i className="fas fa-mountain"></i>
          <span>Summit Seekers</span>
        </Link>

        <div className="nav-menu">
          <Link to="/" className="nav-link">
            <i className="fas fa-home"></i>
            Adventures
          </Link>
          
          {user ? (
            <>
              <Link to="/create" className="nav-link">
                <i className="fas fa-plus"></i>
                Share Adventure
              </Link>
              
              <div className="user-menu">
                <button
                  className="user-menu-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <i className="fas fa-user"></i>
                  {user.id.substring(0, 8)}...
                  <i className={`fas fa-chevron-down ${showUserMenu ? 'rotated' : ''}`}></i>
                </button>
                
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <p><strong>User ID:</strong> {user.id}</p>
                      <p><strong>Status:</strong> Authenticated</p>
                    </div>
                    <button onClick={handleSignOut} className="dropdown-item">
                      <i className="fas fa-sign-out-alt"></i>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/auth" className="nav-link auth-link">
              <i className="fas fa-key"></i>
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 