// src/App.js
//react
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/Login/login';
import Signup from './Components/Signup/signup';

import Dashboard from './Pages/Dashboard/dashboard';
import Navbar from './Components/Navbar/navbar';
import Purchases from './Pages/ Purchases/purchase';
import Transfers from './Pages/Transfers/transfer';
import Assignments from './Pages/Assignments/assignments';
import Expenditures from './Pages/Expenditures/expenditures';

const AppLayout = ({ Component }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" />;
  return (
    <>
      <Navbar />
      <Component />
    </>
  );
};

const App = () => {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
  <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/dashboard" element={<AppLayout Component={Dashboard} />} />
  <Route path="/purchases" element={<AppLayout Component={Purchases} />} />
  <Route path="/transfers" element={<AppLayout Component={Transfers} />} />
  <Route path="/assignments" element={<AppLayout Component={Assignments} />} />
  <Route path="/expenditures" element={<AppLayout Component={Expenditures} />} />

  <Route path="*" element={<Navigate to="/" />} />
</Routes>

    </Router>
  );
};

export default App;
