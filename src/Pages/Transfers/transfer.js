// src/pages/Transfers.js
import React, { useEffect, useState } from 'react';
import './Transfers.css';

const Transfers = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const assignedBase = localStorage.getItem('assignedBase');
  const [transfers, setTransfers] = useState([]);
  const [equipmentType, setEquipmentType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [toBase, setToBase] = useState('');
  const [fromBase, setFromBase] = useState(assignedBase);
  const [allBases, setAllBases] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState(0);
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchTransfers();
    fetchBases();
  }, []);

  const fetchBases = async () => {
    const res = await fetch('http://localhost:5001/api/bases', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setAllBases(data);
  };

  const fetchTransfers = async () => {
    const res = await fetch('http://localhost:5001/api/transfers', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    let filtered = data;
    if (role === 'commander') {
      filtered = data.filter(t => t.fromBase._id === assignedBase);
    }
    if (filterType) {
      filtered = filtered.filter(t => t.equipmentType.includes(filterType));
    }
    if (filterDate) {
      filtered = filtered.filter(t => t.date.startsWith(filterDate));
    }
    setTransfers(filtered);
  };

  const handleAddTransfer = async () => {
    if (!equipmentType || !quantity || !toBase) return alert('Fill all fields');
    const body = {
      equipmentType,
      quantity: parseInt(quantity),
      fromBase: role === 'admin' ? fromBase : assignedBase,
      toBase
    };

    const res = await fetch('http://localhost:5001/api/transfers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setEquipmentType('');
      setQuantity('');
      setToBase('');
      fetchTransfers();
    }
  };

  const handleUpdate = async (id) => {
    const updated = transfers.find(t => t._id === id);
    if (!updated) return;

    const body = {
      equipmentType: updated.equipmentType,
      quantity: parseInt(editingQuantity),
      fromBase: updated.fromBase._id,
      toBase: updated.toBase._id
    };

    const res = await fetch('http://localhost:5001/api/transfers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setEditingId(null);
      setEditingQuantity(0);
      fetchTransfers();
    }
  };

  return (
    <div className="transfers-container">
      <h2 className="transfers-title">🔁 Transfers</h2>

      {(role === 'admin' || role === 'logistics') && (
        <div className="transfers-form">
          <input
            type="text"
            placeholder="Equipment Type"
            value={equipmentType}
            onChange={(e) => setEquipmentType(e.target.value)}
            className="transfers-input"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="transfers-input"
          />
          <select
            value={toBase}
            onChange={(e) => setToBase(e.target.value)}
            className="transfers-select"
          >
            <option value=''>-- To Base --</option>
            {allBases.filter(b => b._id !== assignedBase).map(b => (
              <option key={b._id} value={b._id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
          <button onClick={handleAddTransfer} className="transfers-button">
            Add Transfer
          </button>
        </div>
      )}

      <div className="transfers-filters">
        <input
          type="text"
          placeholder="Filter by Equipment Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="transfers-input"
        />
        <input
          type="date"
          onChange={(e) => setFilterDate(e.target.value)}
          className="transfers-input"
        />
        <button onClick={fetchTransfers} className="transfers-button">
          Apply Filters
        </button>
      </div>

      <table className="transfers-table">
        <thead>
          <tr>
            <th>Equipment</th>
            <th>Quantity</th>
            <th>From Base</th>
            <th>To Base</th>
            <th>Date</th>
            {role === 'commander' && <th>Update</th>}
          </tr>
        </thead>
        <tbody>
          {transfers.map((t) => (
            <tr key={t._id}>
              <td>{t.equipmentType}</td>
              <td>
                {editingId === t._id ? (
                  <input
                    type="number"
                    value={editingQuantity}
                    onChange={(e) => setEditingQuantity(e.target.value)}
                    className="transfers-input-small"
                  />
                ) : (
                  t.quantity
                )}
              </td>
              <td>{t.fromBase?.name || 'N/A'}</td>
              <td>{t.toBase?.name || 'N/A'}</td>
              <td>{t.date?.slice(0, 10)}</td>
              {role === 'commander' && (
                <td>
                  {editingId === t._id ? (
                    <button
                      onClick={() => handleUpdate(t._id)}
                      className="transfers-button"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(t._id);
                        setEditingQuantity(t.quantity);
                      }}
                      className="transfers-button"
                    >
                      Edit
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transfers;
