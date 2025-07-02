import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegisterUser from './registeruser';
import LoginUser from './LoginUser';
import ProfileForm from './ProfileForm';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div>
        <h1>Job Application Helper</h1>
        <Routes>
          <Route path="/" element={
            <>
              <h2>Register</h2>
              <RegisterUser />
              <h2>Login</h2>
              <LoginUser />
              <h3>Profile</h3>
              <ProfileForm />
            </>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
