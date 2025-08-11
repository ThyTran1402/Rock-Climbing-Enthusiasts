import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import './HomeFeed.css';

const HomeFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('time');

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

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <div className="home-feed">
      <div className="feed-header">
        <h2>Recent Adventures</h2>
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomeFeed; 