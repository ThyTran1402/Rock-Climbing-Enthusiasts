import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './CreatePost.css';

const CreatePost = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    location: '',
    grade: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!user) {
      setError('You must be authenticated to create a post');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const postData = {
        user_id: user.id,
        title: formData.title.trim(),
        content: formData.content.trim(),
        image_url: formData.imageUrl.trim() || null,
        location: formData.location.trim() || null,
        grade: formData.grade.trim() || null,
        upvotes: 0,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select();

      if (error) {
        console.error('Error creating post:', error);
        setError(`Failed to create post: ${error.message}`);
      } else {
        console.log('Post created successfully:', data);
        navigate(`/post/${data[0].id}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post">
      <div className="create-container">
        <h2>Share Your Adventure</h2>
        <p className="create-description">
          Tell the climbing community about your latest conquest, epic fail, or gear discovery!
        </p>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label htmlFor="title">Adventure Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What's your adventure called?"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Your Story</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Share the details of your climbing adventure, the challenges you faced, or the lessons you learned..."
              className="form-textarea"
              rows="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Image URL (Optional)</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="form-input"
            />
            <small>Paste a link to an image of your adventure</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location (Optional)</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Where did this happen?"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="grade">Grade/Difficulty (Optional)</label>
              <input
                type="text"
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                placeholder="5.10a, V4, etc."
                className="form-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Share Adventure
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost; 