import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProfileForm() {
  const [formData, setFormData] = useState({
    bio: '',
    experience: '',
    skills: '',
    education: '',
  });

  const user_id = localStorage.getItem('user_id'); // Assuming user_id is stored here after login

  useEffect(() => {
    // Fetch existing profile data when component mounts
    if (user_id) {
      axios.get(`http://localhost:5000/profile/${user_id}`)
        .then(res => setFormData({
          bio: res.data.bio || '',
          experience: res.data.experience || '',
          skills: res.data.skills || '',
          education: res.data.education || '',
        }))
        .catch(() => {
          // no existing profile, do nothing
        });
    }
  }, [user_id]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/profile', { ...formData, user_id });
      alert('Profile saved!');
    } catch (err) {
      alert('Failed to save profile');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        name="bio"
        placeholder="Bio"
        value={formData.bio}
        onChange={handleChange}
      />
      <textarea
        name="experience"
        placeholder="Experience"
        value={formData.experience}
        onChange={handleChange}
      />
      <textarea
        name="skills"
        placeholder="Skills"
        value={formData.skills}
        onChange={handleChange}
      />
      <textarea
        name="education"
        placeholder="Education"
        value={formData.education}
        onChange={handleChange}
      />
      <button type="submit">Save Profile</button>
    </form>
  );
}

export default ProfileForm;
