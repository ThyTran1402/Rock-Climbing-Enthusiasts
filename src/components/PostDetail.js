import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState('');

  const fetchPost = useCallback(async () => {
    try {
      console.log('Fetching post with ID:', id);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        setError(`Failed to load post: ${error.message}`);
        setLoading(false);
        return;
      } else {
        console.log('Post fetched successfully:', data);
        setPost(data);
        setError(null);
        setEditFormData({
          title: data.title,
          content: data.content,
          imageUrl: data.image_url || '',
          location: data.location || '',
          grade: data.grade || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setError(`Unexpected error: ${error.message}`);
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
      } else {
        setComments(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [id]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      // If user is logged in, check if they've upvoted this post
      if (user && post) {
        checkUserUpvoteStatus(user.id);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  }, [post]);

  const checkUserUpvoteStatus = useCallback(async (userId) => {
    try {
      // This is a simple check - in a real app you might want a separate upvotes table
      // For now, we'll just check if the user has upvoted by looking at the post data
      // This is a simplified approach
      setHasUpvoted(false);
    } catch (error) {
      console.error('Error checking upvote status:', error);
    }
  }, []);

  // Test function to verify database connection
  const testDatabaseConnection = useCallback(async () => {
    try {
      console.log('Testing database connection...');
      const { data, error } = await supabase
        .from('posts')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
      } else {
        console.log('Database connection test successful:', data);
      }
    } catch (error) {
      console.error('Database connection test error:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const startTime = Date.now();
      const minLoadingTime = 500; // Minimum 500ms loading time
      
      // Test database connection first
      await testDatabaseConnection();
      
      await Promise.all([
        fetchPost(),
        fetchComments(),
        fetchCurrentUser()
      ]);
      
      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [fetchPost, fetchComments, fetchCurrentUser, testDatabaseConnection]);


  const handleUpvote = async () => {
    if (!post || upvoting) return;

    setUpvoting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ upvotes: (post.upvotes || 0) + 1 })
        .eq('id', id);

      if (error) {
        console.error('Error upvoting:', error);
      } else {
        setPost(prev => ({ ...prev, upvotes: (prev.upvotes || 0) + 1 }));
        setHasUpvoted(true);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUpvoting(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    setCommentError('');
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setCommentError('You must be signed in to comment');
        setSubmittingComment(false);
        return;
      }

      const { error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: id,
            user_id: user.id,
            content: commentText.trim(),
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error creating comment:', error);
        setCommentError('Failed to post comment. Please try again.');
      } else {
        setCommentText('');
        setCommentError('');
        setCommentSuccess('Comment posted successfully!');
        // Show success message briefly
        setTimeout(() => {
          setCommentSuccess('');
          fetchComments();
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      setCommentError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim()) return;

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('You must be signed in to edit posts');
        return;
      }

      // Check if user owns the post
      if (post.user_id !== user.id) {
        alert('You can only edit your own posts');
        return;
      }

      const { error } = await supabase
        .from('posts')
        .update({
          title: editFormData.title.trim(),
          content: editFormData.content.trim(),
          image_url: editFormData.imageUrl.trim(),
          location: editFormData.location.trim(),
          grade: editFormData.grade
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating post:', error);
      } else {
        fetchPost();
        setShowEditForm(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('You must be signed in to delete posts');
        return;
      }

      // Check if user owns the post
      if (post.user_id !== user.id) {
        alert('You can only delete your own posts');
        return;
      }

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting post:', error);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error:', error);
    }
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading adventure...</p>
        <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
          Please wait while we fetch your climbing story
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Oops! Something went wrong</h3>
        <p style={{ color: '#e74c3c', marginBottom: '2rem' }}>{error}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            <i className="fas fa-redo"></i>
            Try Again
          </button>
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            <i className="fas fa-home"></i>
            Back to Adventures
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="error-container">
        <h3>Post not found</h3>
        <p>The adventure you're looking for doesn't exist or may have been removed.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          <i className="fas fa-mountain"></i>
          Back to Adventures
        </button>
      </div>
    );
  }

  return (
    <div className="post-detail">
      <div className="post-detail-container">
        <button onClick={() => navigate('/')} className="back-btn">
          <i className="fas fa-arrow-left"></i>
          Back to Adventures
        </button>

        {showEditForm ? (
          <div className="edit-form-container">
            <h3>Edit Adventure</h3>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={editFormData.content}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows="6"
                  className="form-textarea"
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={editFormData.imageUrl}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Grade</label>
                  <select
                    value={editFormData.grade}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, grade: e.target.value }))}
                    className="form-select"
                  >
                    <option value="">Select grade</option>
                    <option value="5.5">5.5</option>
                    <option value="5.6">5.6</option>
                    <option value="5.7">5.7</option>
                    <option value="5.8">5.8</option>
                    <option value="5.9">5.9</option>
                    <option value="5.10a">5.10a</option>
                    <option value="5.10b">5.10b</option>
                    <option value="5.10c">5.10c</option>
                    <option value="5.10d">5.10d</option>
                    <option value="5.11a">5.11a</option>
                    <option value="5.11b">5.11b</option>
                    <option value="5.11c">5.11c</option>
                    <option value="5.11d">5.11d</option>
                    <option value="5.12a">5.12a</option>
                    <option value="5.12b">5.12b</option>
                    <option value="5.12c">5.12c</option>
                    <option value="5.12d">5.12d</option>
                    <option value="5.13+">5.13+</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowEditForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="post-content">
            <div className="post-header">
              <h1>{post.title}</h1>
              <div className="post-meta">
                <span className="post-date">
                  <i className="fas fa-clock"></i>
                  {formatDate(post.created_at)}
                </span>
                <div className="post-actions">
                  <button onClick={handleUpvote} className="upvote-btn" disabled={upvoting || hasUpvoted}>
                    <i className="fas fa-thumbs-up"></i>
                    {post.upvotes || 0}
                    {hasUpvoted && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>✓</span>}
                  </button>
                  {currentUser && post.user_id === currentUser.id && (
                    <>
                      <button onClick={() => setShowEditForm(true)} className="btn btn-secondary">
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      <button onClick={handleDelete} className="btn btn-danger">
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </>
                  )}
                </div>
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

            {post.content && (
              <div className="post-body">
                <p>{post.content}</p>
              </div>
            )}

            {post.image_url && (
              <div className="post-image">
                <img src={post.image_url} alt="Climbing adventure" />
              </div>
            )}

            <div className="comments-section">
              <h3>Comments ({comments.length})</h3>
              
              {commentError && (
                <div className="error-message" style={{ marginBottom: '1rem', color: '#e74c3c' }}>
                  <i className="fas fa-exclamation-triangle"></i>
                  {commentError}
                </div>
              )}
              
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts on this adventure..."
                  rows="3"
                  className="comment-input"
                />
                <button type="submit" className="btn btn-primary" disabled={submittingComment}>
                  {submittingComment ? 'Posting...' : 'Add Comment'}
                </button>
              </form>

              {commentSuccess && (
                <div className="success-message" style={{ marginTop: '1rem', color: '#27ae60' }}>
                  <i className="fas fa-check-circle"></i>
                  {commentSuccess}
                </div>
              )}

              <div className="comments-list">
                {comments.length === 0 ? (
                  <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment">
                      <div className="comment-content">
                        <p>{comment.content}</p>
                      </div>
                      <div className="comment-meta">
                        <span className="comment-date">
                          <i className="fas fa-clock"></i>
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail; 