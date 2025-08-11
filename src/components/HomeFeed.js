import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useUser } from '../contexts/UserContext';
import './HomeFeed.css';

const HomeFeed = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('time');
  const [selectedFlags, setSelectedFlags] = useState([]);
  const [showContent, setShowContent] = useState(true);
  const [showImages, setShowImages] = useState(true);
  const [colorScheme, setColorScheme] = useState('default');

  const availableFlags = [
    { id: 'question', label: 'Question', icon: 'fas fa-question-circle' },
    { id: 'opinion', label: 'Opinion', icon: 'fas fa-comment' },
    { id: 'trip-report', label: 'Trip Report', icon: 'fas fa-map-marked-alt' },
    { id: 'gear-review', label: 'Gear Review', icon: 'fas fa-tools' },
    { id: 'beta', label: 'Beta', icon: 'fas fa-lightbulb' },
    { id: 'safety', label: 'Safety', icon: 'fas fa-shield-alt' }
  ];

  const colorSchemes = [
    { id: 'default', name: 'Default', primary: '#667eea', secondary: '#764ba2' },
    { id: 'nature', name: 'Nature', primary: '#4ade80', secondary: '#059669' },
    { id: 'sunset', name: 'Sunset', primary: '#f59e0b', secondary: '#dc2626' },
    { id: 'ocean', name: 'Ocean', primary: '#06b6d4', secondary: '#0891b2' }
  ];

  const fetchPosts = useCallback(async () => {
    try {
      console.log('Fetching posts with sort:', sortBy);
      let query = supabase
        .from('posts')
        .select('*');

      if (sortBy === 'time') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'upvotes') {
        query = query.order('upvotes', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        console.log('Posts fetched successfully:', data);
        setPosts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFlags = selectedFlags.length === 0 || 
                        selectedFlags.some(flag => post.flags?.includes(flag));
    
    return matchesSearch && matchesFlags;
  });

  const handleFlagToggle = (flagId) => {
    setSelectedFlags(prev => 
      prev.includes(flagId)
        ? prev.filter(id => id !== flagId)
        : [...prev, flagId]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentColorScheme = () => {
    return colorSchemes.find(scheme => scheme.id === colorScheme) || colorSchemes[0];
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading adventures...</p>
      </div>
    );
  }

  return (
    <div className={`home-feed color-scheme-${colorScheme}`}>
      <div className="feed-header">
        <h2>Recent Adventures</h2>
        
        {/* Interface Customization */}
        <div className="interface-controls">
          <div className="color-scheme-selector">
            <label>Color Scheme:</label>
            <select
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value)}
              className="scheme-select"
            >
              {colorSchemes.map(scheme => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="display-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showContent}
                onChange={(e) => setShowContent(e.target.checked)}
              />
              Show Content
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showImages}
                onChange={(e) => setShowImages(e.target.checked)}
              />
              Show Images
            </label>
          </div>
        </div>

        <div className="feed-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search adventures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          
          <div className="sort-container">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="time">Latest</option>
              <option value="upvotes">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Flag Filtering */}
        <div className="flag-filters">
          <h4>Filter by Post Type:</h4>
          <div className="flags-grid">
            {availableFlags.map(flag => (
              <label key={flag.id} className="flag-checkbox">
                <input
                  type="checkbox"
                  checked={selectedFlags.includes(flag.id)}
                  onChange={() => handleFlagToggle(flag.id)}
                />
                <i className={flag.icon}></i>
                {flag.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="posts-grid">
        {filteredPosts.length === 0 ? (
          <div className="no-posts">
            <i className="fas fa-mountain"></i>
            <h3>No adventures found</h3>
            <p>Be the first to share your climbing story!</p>
            <Link to="/create" className="btn btn-primary">
              Share Your Adventure
            </Link>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="post-card">
              <Link to={`/post/${post.id}`} className="post-link">
                <div className="post-header">
                  <h3 className="post-title">{post.title}</h3>
                  <div className="post-meta">
                    <span className="post-date">
                      <i className="fas fa-clock"></i>
                      {formatDate(post.created_at)}
                    </span>
                    <span className="post-upvotes">
                      <i className="fas fa-thumbs-up"></i>
                      {post.upvotes || 0}
                    </span>
                  </div>
                </div>
                
                {post.flags && post.flags.length > 0 && (
                  <div className="post-flags">
                    {post.flags.map(flag => (
                      <span key={flag} className="post-flag">
                        {flag}
                      </span>
                    ))}
                  </div>
                )}
                
                {showContent && post.content && (
                  <div className="post-content-preview">
                    <p>{post.content.substring(0, 150)}...</p>
                  </div>
                )}
                
                {showImages && post.image_url && (
                  <div className="post-image-preview">
                    <img src={post.image_url} alt="Post preview" />
                  </div>
                )}
                
                {post.location && (
                  <div className="post-location">
                    <i className="fas fa-map-marker-alt"></i>
                    {post.location}
                  </div>
                )}
                {post.grade && (
                  <div className="post-grade">
                    <i className="fas fa-chart-line"></i>
                    Grade: {post.grade}
                  </div>
                )}
              </Link>
              
              <div className="post-actions">
                <button 
                  className="upvote-btn-small"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('posts')
                        .update({ upvotes: (post.upvotes || 0) + 1 })
                        .eq('id', post.id);
                      
                      if (!error) {
                        // Refresh posts to show updated upvote count
                        fetchPosts();
                      }
                    } catch (error) {
                      console.error('Error upvoting:', error);
                    }
                  }}
                >
                  <i className="fas fa-thumbs-up"></i>
                  Upvote
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomeFeed; 