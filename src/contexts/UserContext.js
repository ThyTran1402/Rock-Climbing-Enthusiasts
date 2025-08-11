import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing pseudo-authentication
    const storedUserId = localStorage.getItem('climbing_forum_user_id');
    const storedSecretKey = localStorage.getItem('climbing_forum_secret_key');
    
    if (storedUserId && storedSecretKey) {
      setUser({ id: storedUserId, secretKey: storedSecretKey });
    }
    setLoading(false);
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
  };

  const signOut = () => {
    localStorage.removeItem('climbing_forum_user_id');
    localStorage.removeItem('climbing_forum_secret_key');
    setUser(null);
  };

  const value = {
    user,
    loading,
    updateUser,
    signOut
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
