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
      <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b border-blue-50 pb-2 flex items-center gap-2">👤 Profile Summary</h3>
        <p className="text-gray-600">User not logged in</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
      <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b border-blue-50 pb-2 flex items-center gap-2">👤 Profile Summary</h3>
      {editMode ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio:</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience:</label>
            <textarea name="experience" value={formData.experience} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills:</label>
            <input type="text" name="skills" value={formData.skills} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Education:</label>
            <input type="text" name="education" value={formData.education} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 font-medium">Save Profile</button>
        </form>
      ) : (
        profile && (
          <div className="profile-info space-y-2">
            <ul className="divide-y divide-blue-50">
              <li className="py-2"><strong className="text-gray-700">Bio:</strong> <span className="text-gray-900">{profile.bio}</span></li>
              <li className="py-2"><strong className="text-gray-700">Experience:</strong> <span className="text-gray-900">{profile.experience}</span></li>
              <li className="py-2"><strong className="text-gray-700">Skills:</strong> <span className="text-gray-900">{profile.skills}</span></li>
              <li className="py-2"><strong className="text-gray-700">Education:</strong> <span className="text-gray-900">{profile.education}</span></li>
            </ul>
            <button onClick={() => setEditMode(true)} className="mt-4 bg-blue-100 text-blue-700 rounded-lg px-4 py-2 hover:bg-blue-200 font-medium">Edit Profile</button>
          </div>
        )
      )}
    </div>
  );
}

export default ProfileSummary;
