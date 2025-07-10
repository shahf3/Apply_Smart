import React, { useState, useEffect } from "react";
import ProfileSummary from "./ProfileSummary";
import ResumeUpload from "./ResumeUpload";
import ATSScoringCard from "./ATSScoringCard";
import JobSearchResults from "./JobSearchResults";
import "../styles/Dashboard.css"; // Import the CSS file
import EditResumeDashboard from "./EditResumeDashboard";

function Dashboard() {
  const [userId, setUserId] = useState();

  useEffect(() => {
    const storedId = localStorage.getItem("user_id");
    if (storedId) {
      setUserId(parseInt(storedId));
    }
  }, []);
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome to your Dashboard</h2>
        <p>Manage your career journey with powerful tools and insights</p>
      </div>

      <div className="dashboard-grid">
        <ProfileSummary />
        <ResumeUpload />
        <ATSScoringCard />
        <JobSearchResults />
        {userId ? (
          <EditResumeDashboard userId={userId} />
        ) : (
          <p>Loading user information...</p>
        )}
      </div>

      <div className="coming-soon">
        <h3>Application Tracker</h3>
        <p>
          Track your job applications, interview schedules, and follow-ups all
          in one place
        </p>
        <p>
          <strong>Coming soon...</strong>
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
