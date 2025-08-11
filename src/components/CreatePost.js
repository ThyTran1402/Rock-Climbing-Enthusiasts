import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { UserContext } from '../contexts/UserContext';
import './CreatePost.css';

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    location: '',
    grade: '',
    flags: [],
    repostId: '',
    videoUrl: '',
    difficulty: '',
    weather: '',
    equipment: '',
    partners: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const availableFlags = [
    { id: 'question', label: 'Question', icon: 'fas fa-question-circle' },
    { id: 'opinion', label: 'Opinion', icon: 'fas fa-comment' },
    { id: 'trip-report', label: 'Trip Report', icon: 'fas fa-map-marked-alt' },
    { id: 'gear-review', label: 'Gear Review', icon: 'fas fa-tools' },
    { id: 'beta', label: 'Beta', icon: 'fas fa-lightbulb' },
    { id: 'safety', label: 'Safety', icon: 'fas fa-shield-alt' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFlagToggle = (flagId) => {
    setFormData(prev => ({
      ...prev,
      flags: prev.flags.includes(flagId)
        ? prev.flags.filter(id => id !== flagId)
        : [...prev.flags, flagId]
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
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
      let finalImageUrl = formData.imageUrl;

      // Upload local image if selected
      if (selectedImage) {
        try {
          finalImageUrl = await uploadImage(selectedImage);
        } catch (uploadError) {
          setError('Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }
      }

      const postData = {
        user_id: user.id,
        title: formData.title.trim(),
        content: formData.content.trim(),
        image_url: finalImageUrl,
        location: formData.location.trim(),
        grade: formData.grade,
        flags: formData.flags,
        repost_id: formData.repostId.trim() || null,
        video_url: formData.videoUrl.trim(),
        difficulty: formData.difficulty.trim(),
        weather: formData.weather.trim(),
        equipment: formData.equipment.trim(),
        partners: formData.partners.trim(),
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
            <label>Post Flags</label>
            <div className="flags-grid">
              {availableFlags.map(flag => (
                <label key={flag.id} className="flag-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.flags.includes(flag.id)}
                    onChange={() => handleFlagToggle(flag.id)}
                  />
                  <i className={flag.icon}></i>
                  {flag.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="repostId">Repost ID (Optional)</label>
            <input
              type="text"
              id="repostId"
              name="repostId"
              value={formData.repostId}
              onChange={handleChange}
              placeholder="Enter post ID to reference another post"
              className="form-input"
            />
            <small>Reference another post to create a thread</small>
          </div>

          <div className="form-group">
            <label htmlFor="videoUrl">Video URL (Optional)</label>
            <input
              type="url"
              id="videoUrl"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
              className="form-input"
            />
            <small>Add a video of your climb or technique!</small>
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
            <small>Or upload an image from your device below</small>
          </div>

          <div className="form-group">
            <label htmlFor="imageFile">Upload Local Image</label>
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              onChange={handleImageSelect}
              className="form-input"
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty Level</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Hard">Hard</option>
                <option value="Extreme">Extreme</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="weather">Weather Conditions</label>
              <input
                type="text"
                id="weather"
                name="weather"
                value={formData.weather}
                onChange={handleChange}
                placeholder="e.g., Sunny, 75°F"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="equipment">Equipment Used</label>
            <input
              type="text"
              id="equipment"
              name="equipment"
              value={formData.equipment}
              onChange={handleChange}
              placeholder="e.g., Harness, rope, quickdraws, helmet"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="partners">Climbing Partners</label>
            <input
              type="text"
              id="partners"
              name="partners"
              value={formData.partners}
              onChange={handleChange}
              placeholder="e.g., John, Sarah, Mike"
              className="form-input"
            />
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