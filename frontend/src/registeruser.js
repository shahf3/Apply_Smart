import React, { useState} from 'react';
import axios from 'axios';

function RegisterUser() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/register', formData);
            alert(response.data.message);
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Registration failed. Please try again.');
        }
    };
    
    return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Username" onChange={handleChange} required />
      <input name="firstname" placeholder="First Name" onChange={handleChange} required />
      <input name="lastname" placeholder="Last Name" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Register</button>
    </form>
    );
}

export default RegisterUser;
