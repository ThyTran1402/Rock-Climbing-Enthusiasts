import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onAuthChange }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await onAuthChange();
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return user?.id?.substring(0, 8) || 'User';
  };

  const getUserAvatar = () => {
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    if (user?.user_metadata?.picture) {
      return user.user_metadata.picture;
    }
    return null;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <i className="fas fa-mountain"></i>
          <span>Ayo Rock Climbers</span>
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
                  {getUserAvatar() ? (
                    <img 
                      src={getUserAvatar()} 
                      alt="User avatar" 
                      className="user-avatar"
                    />
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                  {getUserDisplayName()}
                  <i className={`fas fa-chevron-down ${showUserMenu ? 'rotated' : ''}`}></i>
                </button>
                
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <p><strong>Name:</strong> {getUserDisplayName()}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Provider:</strong> {user.app_metadata?.provider || 'email'}</p>
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