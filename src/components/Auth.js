import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import './Auth.css';

const Auth = () => {
  const { user, updateUser } = useUser();
  const [secretKey, setSecretKey] = useState('');
  const [userId, setUserId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already authenticated
    const storedUserId = localStorage.getItem('climbing_forum_user_id');
    const storedSecretKey = localStorage.getItem('climbing_forum_secret_key');
    
    if (storedUserId && storedSecretKey) {
      setUserId(storedUserId);
      setSecretKey(storedSecretKey);
      setIsAuthenticated(true);
      updateUser({ id: storedUserId, secretKey: storedSecretKey });
    } else {
      // Generate random user ID if none exists
      const newUserId = generateRandomUserId();
      setUserId(newUserId);
      localStorage.setItem('climbing_forum_user_id', newUserId);
    }
  }, [updateUser]);

  const generateRandomUserId = () => {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  };

  const handleSecretKeySubmit = async (e) => {
    e.preventDefault();
    
    if (!secretKey.trim()) {
      setError('Please enter a secret key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Store the secret key
      localStorage.setItem('climbing_forum_secret_key', secretKey.trim());
      setIsAuthenticated(true);
      updateUser({ id: userId, secretKey: secretKey.trim() });
    } catch (error) {
      console.error('Error setting secret key:', error);
      setError('Failed to set secret key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated || user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Welcome, Climber!</h2>
          <div className="user-info">
            <p><strong>User ID:</strong> {userId || user?.id}</p>
            <p><strong>Status:</strong> Authenticated</p>
          </div>
          <p className="success-message">
            <i className="fas fa-check-circle"></i>
            You're all set! You can now create posts and interact with the community.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome to Rock Climbing Forum</h2>
        <div className="user-info">
          <p><strong>Your User ID:</strong> {userId}</p>
          <p className="info-text">This ID will be associated with all your posts and comments.</p>
        </div>
        
        <form onSubmit={handleSecretKeySubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="secretKey">Set Your Secret Key</label>
            <input
              type="password"
              id="secretKey"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter a secret key to protect your posts"
              className="form-input"
              required
            />
            <small>This key will be required to edit or delete your posts.</small>
          </div>
          
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Setting Key...
              </>
            ) : (
              <>
                <i className="fas fa-key"></i>
                Set Secret Key
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth; 