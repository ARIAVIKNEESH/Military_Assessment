// src/pages/Login.js
//react
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5001/api/login', {
        username,
        password,
      });

      const { token } = res.data;
      const decoded = JSON.parse(atob(token.split('.')[1]));

      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('role', decoded.role);
      localStorage.setItem('assignedBase', decoded.base);
      localStorage.setItem('identifier', decoded.identifier);

      alert(`Welcome ${decoded.role.toUpperCase()} (${decoded.identifier})`);
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed. Please check your credentials.');
      console.error(err);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 id="login-heading">Login to Your Account</h2>

        <div className="login-field">
          <svg className="login-input-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 15c2.21 0 4.292.534 6.121 1.474M15 12a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
          <input
            type="text"
            className="login-input-field"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="login-field">
          <svg className="login-input-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 11c0-1.104-.896-2-2-2s-2 .896-2 2m4 0c0 1.104.896 2 2 2s2-.896 2-2m-4 0V6m0 0a2 2 0 112 2m-2-2a2 2 0 11-2 2" />
          </svg>
          <input
            type="password"
            className="login-input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="login-btn">
          <button className="login-button2" type="submit">Sign In</button>
        </div>

        <div className="login-btn">
          <p className="login-signup-link">
            No account? <a href="/signup">Sign up</a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
