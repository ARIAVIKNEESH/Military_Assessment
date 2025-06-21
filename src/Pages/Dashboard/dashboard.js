import React, { useEffect, useState } from 'react';
import './dashboard.css';

const Dashboard = () => {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [assignedBase, setAssignedBase] = useState(localStorage.getItem('assignedBase'));
  const [identifier, setIdentifier] = useState(localStorage.getItem('identifier'));
  const [bases, setBases] = useState([]);
  const [commanders, setCommanders] = useState([]);
  const [selectedBase, setSelectedBase] = useState('');
  const [selectedCommander, setSelectedCommander] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role === 'admin') {
      fetchAllBases();
      fetchCommanders();
    } else {
      setSelectedBase(assignedBase);
      fetchDashboard(assignedBase);
    }
  }, []);

  const fetchAllBases = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/bases', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBases(data);
    } catch (err) {
      setError('Failed to load bases');
    }
  };

  const fetchCommanders = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/users?role=commander', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCommanders(data);
    } catch (err) {
      setError('Failed to load commanders');
    }
  };

  const fetchDashboard = async (baseId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/dashboard?base=${baseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    }
  };

  const handleSelectCommander = async (commanderId) => {
    setSelectedCommander(commanderId);
    try {
      const res = await fetch(`http://localhost:5001/api/users/${commanderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSelectedBase(data.assignedBase._id);
      fetchDashboard(data.assignedBase._id);
    } catch (err) {
      setError('Failed to fetch commander data');
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>

      {role === 'admin' && (
        <>
          <div className="dashboard-select-wrapper">
            <label htmlFor="commander" className="dashboard-label">Select Commander:</label>
            <select
              id="commander"
              value={selectedCommander}
              onChange={(e) => handleSelectCommander(e.target.value)}
              className="dashboard-select"
            >
              <option value="">--Select--</option>
              {commanders.map((cmd) => (
                <option key={cmd._id} value={cmd._id}>
                  {cmd.username} ({cmd.identifier})
                </option>
              ))}
            </select>
          </div>
          <p className="dashboard-info">Viewing Base ID: <strong>{selectedBase}</strong></p>
        </>
      )}

      {role !== 'admin' && (
        <p className="dashboard-info"><strong>Your Base ID:</strong> {assignedBase}</p>
      )}

      {dashboardData ? (
        <div className="dashboard-data">
          {role === 'logistics' ? (
            <>
              <p>🔹 <strong>Opening Balance:</strong> {dashboardData.openingBalance}</p>
              <ul className="dashboard-breakdown">
                <li>Purchases: {dashboardData.breakdown.totalPurchased}</li>
              </ul>
            </>
          ) : (
            <>
              <p>🔹 <strong>Opening Balance:</strong> {dashboardData.openingBalance}</p>
              <p>🟢 <strong>Net Movement:</strong> {dashboardData.netMovement}</p>
              <ul className="dashboard-breakdown">
                <li>Purchases: {dashboardData.breakdown.totalPurchased}</li>
                <li>Transfer In: {dashboardData.breakdown.totalTransferIn}</li>
                <li>Transfer Out: {dashboardData.breakdown.totalTransferOut}</li>
              </ul>
              <p>🧍 <strong>Assigned:</strong> {dashboardData.totalAssigned}</p>
              <p>🔥 <strong>Expended:</strong> {dashboardData.totalExpended}</p>
              <p>📦 <strong>Closing Balance:</strong> {dashboardData.closingBalance}</p>
              {/* Example Edit button (only shown if NOT logistics) */}
              {/* <button>Edit</button> */}
            </>
          )}
        </div>
      ) : (
        <p className="dashboard-loading">Loading dashboard...</p>
      )}

      {error && <p className="dashboard-error">{error}</p>}
    </div>
  );
};

export default Dashboard;
