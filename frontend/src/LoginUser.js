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
    <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-white/20">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input 
                name="username" 
                placeholder="Username" 
                onChange={handleChange} 
                required 
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
            <input 
                type="password" 
                name="password" 
                placeholder="Password" 
                onChange={handleChange} 
                required 
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
            <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
                Login
            </button>
        </form>
    </div>
  );
}

export default LoginUser;
