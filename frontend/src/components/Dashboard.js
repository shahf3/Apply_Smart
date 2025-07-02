import React from 'react';
import ProfileSummary from './ProfileSummary';
import ResumeUpload from  './ResumeUpload';


function Dashboard() {
  return (
    <div>
      <h2>Welcome to your Dashboard</h2>
      <ProfileSummary />
      <ResumeUpload />

      {/* Placeholder components for now */}

      <div>
        <h3>Application Tracker</h3>
        <p>Coming soon...</p>
      </div>
    </div>
  );
}

export default Dashboard;
