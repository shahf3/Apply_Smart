import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProfileSummary() {
  const [profile, setProfile] = useState(null);
  const user_id = localStorage.getItem('user_id');

  useEffect(() => {
    if (user_id) {
      axios.get(`http://localhost:5000/profile/${user_id}`)
        .then(res => setProfile(res.data))
        .catch(() => setProfile(null));
    }
  }, [user_id]);

  if (!user_id) return <p>User not logged in</p>;

  return (
    <div>
      <h3>Profile Summary</h3>
      {profile ? (
        <ul>
          <li><strong>Bio:</strong> {profile.bio}</li>
          <li><strong>Experience:</strong> {profile.experience}</li>
          <li><strong>Skills:</strong> {profile.skills}</li>
          <li><strong>Education:</strong> {profile.education}</li>
        </ul>
      ) : (
        <p>No profile data available. Please create your profile.</p>
      )}
    </div>
  );
}

export default ProfileSummary;
