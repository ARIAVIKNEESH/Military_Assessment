// src/pages/Signup.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './signup.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [identifier, setIdentifier] = useState('');
  const [baseInput, setBaseInput] = useState('');
  const [selectedBaseId, setSelectedBaseId] = useState('');
  const [availableBases, setAvailableBases] = useState([]);

  useEffect(() => {
    if (role !== 'admin') {
      axios.get('http://localhost:5001/api/bases')
        .then(res => setAvailableBases(res.data))
        .catch(() => alert('Failed to load bases'));
    }
  }, [role]);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!username || !password || !identifier || (role === 'admin' && !baseInput)) {
      return alert('Please fill all fields');
    }

    try {
      let assignedBaseId = selectedBaseId;

      if (role === 'admin') {
        const token = localStorage.getItem('token');
        const baseRes = await axios.post('http://localhost:5001/api/bases', {
          name: baseInput,
          code: baseInput.toUpperCase().replace(/\s+/g, '_'),
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        assignedBaseId = baseRes.data._id;
      }

      await axios.post('http://localhost:5001/api/register', {
        username,
        password,
        role,
        assignedBase: assignedBaseId,
        identifier,
      });

      alert('Signup successful!');
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="signup-wrapper">
    <form className="signup-form" onSubmit={handleSignup}>
      <h2 id="signup-heading">Create an Account</h2>

      <div className="signup-field">
        <input
          className="signup-input-field"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          required
        />
      </div>

      <div className="signup-field">
        <input
          className="signup-input-field"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
      </div>

      <div className="signup-field">
        <select
          className="signup-input-field"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="commander">Commander</option>
          <option value="logistics">Logistics</option>
        </select>
      </div>

      {role === 'admin' ? (
        <div className="signup-field">
          <input
            className="signup-input-field"
            placeholder="Enter New Base Name"
            value={baseInput}
            onChange={(e) => setBaseInput(e.target.value)}
            type="text"
            required
          />
        </div>
      ) : (
        <div className="signup-field">
          <select
            className="signup-input-field"
            value={selectedBaseId}
            onChange={(e) => setSelectedBaseId(e.target.value)}
            required
          >
            <option value="">Select Assigned Base</option>
            {availableBases.map((base) => (
              <option key={base._id} value={base._id}>
                {base.name} ({base.code})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="signup-field">
        <input
          className="signup-input-field"
          placeholder="Identifier (e.g. A1C2L1)"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          type="text"
          required
        />
      </div>

      <div className="signup-btn">
        <button className="signup-button2" type="submit">Sign Up</button>
      </div>

      <div className="signup-btn">
        <p className="signup-link">
          Already have an account? <a href="/">Login</a>
        </p>
      </div>
      
    </form>
    </div>
  );
};

export default Signup;
