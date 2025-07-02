import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginUser() {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', credentials);
      const { token, user_id } = res.data;
      alert('Login successful!');
      localStorage.setItem('token', token);
      localStorage.setItem('user_id', user_id);
      navigate('/dashboard');
      localStorage.setItem('token', token); // save token for later
    } catch (err) {
      alert(err.response?.data.message || 'Login failed');
    }
  };

   return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Username" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginUser;
