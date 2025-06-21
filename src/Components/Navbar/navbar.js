import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUsername(decoded.username || decoded.id);
      setRole(decoded.role);
    } catch (error) {
      console.error('Invalid token');
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isAdmin = role === 'admin';
  const isCommander = role === 'commander';

  return (
    <nav className="navbar-container">
      <div className="navbar-left">
        <h2 className="navbar-title">Military Asset System</h2>
      </div>

      <div className="navbar-center">
        <NavLink to="/dashboard" className="navbar-link" activeclassname="navbar-active">Dashboard</NavLink>

        {/* Show Purchases for all roles */}
        <NavLink to="/purchases" className="navbar-link" activeclassname="navbar-active">Purchases</NavLink>

        {/* Transfers: Admin only */}
        {isAdmin && (
          <NavLink to="/transfers" className="navbar-link" activeclassname="navbar-active">Transfers</NavLink>
        )}

        {/* Assignments: Admin and Commander */}
        {(isAdmin || isCommander) && (
          <NavLink to="/assignments" className="navbar-link" activeclassname="navbar-active">Assignments</NavLink>
        )}

        {/* Expenditures: Admin only */}
        {isAdmin && (
          <NavLink to="/expenditures" className="navbar-link" activeclassname="navbar-active">Expenditures</NavLink>
        )}
      </div>

      <div className="navbar-right">
        <span className="navbar-user">
          {username && `${username} (${role.toUpperCase()})`}
        </span>
        <button className="navbar-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
