import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './supabase';
import Navbar from './components/Navbar';
import HomeFeed from './components/HomeFeed';
import CreatePost from './components/CreatePost';
import PostDetail from './components/PostDetail';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authTimeout, setAuthTimeout] = useState(false);

  useEffect(() => {
    // Set a timeout to show content even if auth is slow
    const timeoutId = setTimeout(() => {
      setAuthTimeout(true);
    }, 2000); // Show content after 2 seconds max

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      clearTimeout(timeoutId);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      clearTimeout(timeoutId);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading only for a short time, then show content
  if (authLoading && !authTimeout) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="fas fa-mountain fa-spin"></i>
          <p>Loading your climbing adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onAuthChange={handleSignOut} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomeFeed />} />
            <Route path="/create" element={<CreatePost user={user} />} />
            <Route path="/post/:id" element={<PostDetail user={user} />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
