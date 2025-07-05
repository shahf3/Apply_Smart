import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProfileSummary() {
  const user_id = localStorage.getItem('user_id');
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    bio: '',
    experience: '',
    skills: '',
    education: ''
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!user_id) return;

    axios.get(`http://localhost:5000/profile/${user_id}`)
      .then(res => {
        if (res.data && res.data.bio !== undefined) {
          setProfile(res.data);
          setFormData({
            bio: res.data.bio || '',
            experience: res.data.experience || '',
            skills: res.data.skills || '',
            education: res.data.education || ''
          });
          setEditMode(false);
        } else {
          setProfile(null);
          setEditMode(true); // show form if no profile found
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setProfile(null);
        setEditMode(true);
      });
  }, [user_id]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('http://localhost:5000/profile', {
      user_id,
      ...formData
    })
    .then(res => {
      alert(res.data.message);
      setProfile({ ...formData });
      setEditMode(false);
    })
    .catch(err => {
      console.error("Submit error:", err);
      alert('Failed to save profile.');
    });
  };

  if (!user_id) {
    return (
      <div className="card">
        <h3><div className="icon">👤</div>Profile Summary</h3>
        <p>User not logged in</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3><div className="icon">👤</div>Profile Summary</h3>

      {editMode ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Bio:</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} required />
          </div>
          <div>
            <label>Experience:</label>
            <textarea name="experience" value={formData.experience} onChange={handleChange} required />
          </div>
          <div>
            <label>Skills:</label>
            <input type="text" name="skills" value={formData.skills} onChange={handleChange} required />
          </div>
          <div>
            <label>Education:</label>
            <input type="text" name="education" value={formData.education} onChange={handleChange} required />
          </div>
          <button type="submit">Save Profile</button>
        </form>
      ) : (
        profile && (
          <div className="profile-info">
            <ul>
              <li><strong>Bio:</strong> {profile.bio}</li>
              <li><strong>Experience:</strong> {profile.experience}</li>
              <li><strong>Skills:</strong> {profile.skills}</li>
              <li><strong>Education:</strong> {profile.education}</li>
            </ul>
            <button onClick={() => setEditMode(true)}>Edit Profile</button>
          </div>
        )
      )}
    </div>
  );
}

export default ProfileSummary;
