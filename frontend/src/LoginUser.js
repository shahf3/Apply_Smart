import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

function LoginUser() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/login", credentials);
      const { token, user_id, user_name } = res.data;
      alert("Login successful!");
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("user_name", user_name);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data.message || "Login failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send the Google token to the backend for verification
      const res = await axios.post("http://localhost:5000/auth/google", {
        credential: credentialResponse.credential,
      });
      const { token, user_id, user_name } = res.data;
      alert("Google login successful!");
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("user_name", user_name);
      navigate("/dashboard");
    } catch (err) {
      alert("Google login failed");
      console.error("Google login error:", err);
    }
  };

  const handleGoogleFailure = () => {
    alert("Google login failed");
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
      <div className="mt-4 text-center">
        <p className="text-gray-600 mb-2">Or login with</p>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => alert("Google login failed")}
        />
      </div>
    </div>
  );
}

export default LoginUser;
