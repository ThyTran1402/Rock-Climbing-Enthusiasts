import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import './PostDetail.css';

const PostDetail = ({ user }) => {
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

  const handleEditClick = () => {
    if (!user) {
      setError('You must be logged in to edit posts');
      return;
    }
    
    if (user.id !== post.user_id) {
      setError('You can only edit your own posts');
      return;
    }
    
    setShowEditForm(true);
  };

  const handleDeleteClick = () => {
    if (!user) {
      setError('You must be logged in to delete posts');
      return;
    }
    
    if (user.id !== post.user_id) {
      setError('You can only delete your own posts');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      handleDelete();
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      setError('You must be logged in to upvote posts');
      return;
    }

    if (hasUpvoted) {
      setError('You have already upvoted this post');
      return;
    }

    setUpvoting(true);
    setError('');

    try {
      const { error } = await supabase
        .from('posts')
        .update({ upvotes: (post.upvotes || 0) + 1 })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setPost(prev => ({
        ...prev,
        upvotes: (prev.upvotes || 0) + 1
      }));
      setHasUpvoted(true);
    } catch (error) {
      console.error('Error upvoting:', error);
      setError('Failed to upvote post. Please try again.');
    } finally {
      setUpvoting(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }

    if (!user) {
      setCommentError('You must be logged in to comment');
      return;
    }

    setSubmittingComment(true);
    setCommentError('');
    setCommentSuccess('');

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          post_id: id,
          user_id: user.id,
          content: commentText.trim(),
          created_at: new Date().toISOString()
        }]);

      if (error) {
        throw error;
      }

      setCommentText('');
      setCommentSuccess('Comment posted successfully!');
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error posting comment:', error);
      setCommentError('Failed to post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: editFormData.title.trim(),
          content: editFormData.content.trim(),
          image_url: editFormData.imageUrl.trim() || null,
          location: editFormData.location.trim() || null,
          grade: editFormData.grade.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setPost(prev => ({
        ...prev,
        title: editFormData.title.trim(),
        content: editFormData.content.trim(),
        image_url: editFormData.imageUrl.trim() || null,
        location: editFormData.location.trim() || null,
        grade: editFormData.grade.trim() || null
      }));

      setShowEditForm(false);
      setError('');
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Failed to update post. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchPost(),
          fetchComments()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load post data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchPost, fetchComments]);

  useEffect(() => {
    if (user && post) {
      checkUserUpvoteStatus(user.id);
    }
  }, [user, post, checkUserUpvoteStatus]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="fas fa-mountain fa-spin"></i>
          <p>Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="error-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            <i className="fas fa-home"></i>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="error-container">
        <div className="error-message">
          <i className="fas fa-question-circle"></i>
          <h2>Post Not Found</h2>
          <p>The post you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            <i className="fas fa-home"></i>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail">
      <div className="post-container">
        {showEditForm ? (
          <div className="edit-form">
            <h2>Edit Your Adventure</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="edit-title">Title *</label>
                <input
                  type="text"
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-content">Content</label>
                <textarea
                  id="edit-content"
                  value={editFormData.content}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    content: e.target.value
                  }))}
                  className="form-textarea"
                  rows="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-imageUrl">Image URL</label>
                <input
                  type="url"
                  id="edit-imageUrl"
                  value={editFormData.imageUrl}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    imageUrl: e.target.value
                  }))}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-location">Location</label>
                  <input
                    type="text"
                    id="edit-location"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      location: e.target.value
                    }))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-grade">Grade</label>
                  <input
                    type="text"
                    id="edit-grade"
                    value={editFormData.grade}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      grade: e.target.value
                    }))}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="post-header">
              <h1>{post.title}</h1>
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
                {post.grade && (
                  <span className="post-grade">
                    <i className="fas fa-chart-line"></i>
                    {post.grade}
                  </span>
                )}
              </div>
            </div>

            {post.image_url && (
              <div className="post-image">
                <img src={post.image_url} alt={post.title} />
              </div>
            )}

            <div className="post-content">
              <p>{post.content}</p>
            </div>

            <div className="post-actions">
              <button
                onClick={handleUpvote}
                disabled={upvoting || hasUpvoted}
                className={`upvote-btn ${hasUpvoted ? 'upvoted' : ''}`}
              >
                {hasUpvoted ? (
                  <i className="fas fa-check"></i>
                ) : (
                  <i className="fas fa-thumbs-up"></i>
                )}
                {hasUpvoted ? 'Upvoted' : 'Upvote'} ({post.upvotes || 0})
              </button>

              {user && user.id === post.user_id && (
                <div className="post-owner-actions">
                  <button onClick={handleEditClick} className="btn btn-secondary">
                    <i className="fas fa-edit"></i>
                    Edit
                  </button>
                  <button onClick={handleDeleteClick} className="btn btn-danger">
                    <i className="fas fa-trash"></i>
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div className="comments-section">
              <h3>Comments ({comments.length})</h3>
              
              {user ? (
                <form onSubmit={handleCommentSubmit} className="comment-form">
                  <div className="form-group">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts on this adventure..."
                      className="form-textarea"
                      rows="3"
                      required
                    />
                  </div>
                  
                  {commentError && (
                    <div className="error-message">
                      <i className="fas fa-exclamation-triangle"></i>
                      {commentError}
                    </div>
                  )}
                  
                  {commentSuccess && (
                    <div className="success-message">
                      <i className="fas fa-check-circle"></i>
                      {commentSuccess}
                    </div>
                  )}
                  
                  <button type="submit" className="btn btn-primary" disabled={submittingComment}>
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
              ) : (
                <div className="auth-prompt">
                  <p>Please <Link to="/auth">sign in</Link> to leave a comment.</p>
                </div>
              )}

              <div className="comments-list">
                {comments.length === 0 ? (
                  <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="comment">
                      <div className="comment-header">
                        <span className="comment-author">User {comment.user_id.substring(0, 8)}...</span>
                        <span className="comment-date">{formatDate(comment.created_at)}</span>
                      </div>
                      <div className="comment-content">
                        <p>{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PostDetail; 