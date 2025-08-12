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

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

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
        <div className="loading-spinner">
          <i className="fas fa-mountain fa-spin"></i>
          <p>Loading adventures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-feed">
      <div className="feed-container">
        <div className="feed-header">
          <h1>Recent Adventures</h1>
          <p>Discover amazing climbing stories from the community</p>
        </div>

        <div className="feed-controls">
          <div className="search-section">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search adventures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="sort-section">
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

        <div className="posts-grid">
          {filteredPosts.length === 0 ? (
            <div className="no-posts">
              <i className="fas fa-mountain"></i>
              <h3>No adventures found</h3>
              <p>
                {searchTerm 
                  ? `No posts match "${searchTerm}". Try a different search term.`
                  : 'Be the first to share your climbing adventure!'
                }
              </p>
              <Link to="/create" className="btn btn-primary">
                <i className="fas fa-plus"></i>
                Share Your First Adventure
              </Link>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <h3 className="post-title">
                    <Link to={`/post/${post.id}`}>{post.title}</Link>
                  </h3>
                  <div className="post-meta">
                    <span className="post-date">
                      <i className="fas fa-calendar"></i>
                      {formatDate(post.created_at)}
                    </span>
                    {post.location && (
                      <span className="post-location">
                        <i className="fas fa-map-marker-alt"></i>
                        {post.location}
                      </span>
                    )}
                  </div>
                </div>

                {post.content && (
                  <div className="post-content">
                    <p>{post.content.length > 150 
                      ? `${post.content.substring(0, 150)}...` 
                      : post.content}
                    </p>
                  </div>
                )}

                {post.image_url && (
                  <div className="post-image">
                    <img src={post.image_url} alt={post.title} />
                  </div>
                )}

                <div className="post-footer">
                  <div className="post-stats">
                    <span className="post-upvotes">
                      <i className="fas fa-thumbs-up"></i>
                      {post.upvotes || 0}
                    </span>
                    <span className="post-comments">
                      <i className="fas fa-comments"></i>
                      {/* You can add comment count here if you have a comments table */}
                    </span>
                  </div>
                  
                  <Link to={`/post/${post.id}`} className="read-more">
                    Read More <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeFeed; 