import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const user_id = params.get('user_id');
    const user_name = params.get('user_name');

    if (token && user_id) {
      localStorage.setItem('token', token);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('user_name', user_name);
      navigate('/dashboard');
    } else {
      alert('Google login failed');
      navigate('/login');
    }
  }, [navigate, location]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-gray-800">Processing Google login...</p>
    </div>
  );
}

export default GoogleCallback;