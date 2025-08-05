import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './CreatePost.css';

const CreatePost = () => {
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

    setLoading(true);
    setError('');

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('You must be signed in to create a post');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            title: formData.title.trim(),
            content: formData.content.trim(),
            image_url: formData.imageUrl.trim(),
            location: formData.location.trim(),
            grade: formData.grade,
            upvotes: 0,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('Error creating post:', error);
        setError('Failed to create post. Please try again.');
      } else {
        // Navigate to the newly created post
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
              placeholder="e.g., First Lead Climb at Red River Gorge"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Your Story</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              placeholder="Share the details of your climbing adventure, challenges faced, lessons learned..."
              className="form-textarea"
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
              placeholder="https://example.com/your-climbing-photo.jpg"
              className="form-input"
            />
            <small>Add a photo of your climb, gear setup, or the beautiful view!</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Red River Gorge, Kentucky"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="grade">Climbing Grade</label>
              <select
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
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
                  Sharing...
                </>
              ) : (
                <>
                  <i className="fas fa-mountain"></i>
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