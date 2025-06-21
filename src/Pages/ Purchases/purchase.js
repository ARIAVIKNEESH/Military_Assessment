import React, { useEffect, useState } from 'react';
import './Purchases.css';

const Purchases = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const baseId = localStorage.getItem('assignedBase');
  const [purchases, setPurchases] = useState([]);
  const [equipmentType, setEquipmentType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedBase, setSelectedBase] = useState(baseId || '');
  const [allBases, setAllBases] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState(0);
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    if (role === 'admin') fetchBases();
    fetchPurchases();
  }, [selectedBase]);

  const fetchBases = async () => {
    const res = await fetch('http://localhost:5001/api/bases', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setAllBases(data);
  };

  const fetchPurchases = async () => {
    let url = `http://localhost:5001/api/purchases`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    let filtered = data;
    if (role === 'commander') {
      filtered = data.filter(p => p.base === baseId);
    }
    if (filterType) {
      filtered = filtered.filter(p => p.equipmentType.includes(filterType));
    }
    if (filterDate) {
      filtered = filtered.filter(p => p.date.startsWith(filterDate));
    }
    setPurchases(filtered);
  };

  const handleAddPurchase = async () => {
    if (!equipmentType || !quantity) return alert('Fill all fields');
    const body = {
      equipmentType,
      quantity: parseInt(quantity),
      base: role === 'admin' ? selectedBase : baseId,
    };

    const res = await fetch('http://localhost:5001/api/purchases', {
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
      fetchPurchases();
    }
  };

  const handleUpdate = async (id) => {
    const updated = purchases.find(p => p._id === id);
    if (!updated) return;

    const body = {
      equipmentType: updated.equipmentType,
      quantity: parseInt(editingQuantity),
      base: updated.base,
    };

    const res = await fetch(`http://localhost:5001/api/purchases`, {
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
      fetchPurchases();
    }
  };

  return (
    <div className="purchases-container">
      <h2 className="purchases-title">📦 Purchases</h2>

      {role === 'admin' && (
        <div className="purchases-field">
          <label>Select Base:</label>
          <select
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
            className="purchases-select"
          >
            <option value="">-- Choose Base --</option>
            {allBases.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {(role === 'admin' || role === 'logistics') && (
        <div className="purchases-add">
          <input
            type="text"
            placeholder="Equipment Type"
            value={equipmentType}
            onChange={(e) => setEquipmentType(e.target.value)}
            className="purchases-input"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="purchases-input"
          />
          <button onClick={handleAddPurchase} className="purchases-button">Add Purchase</button>
        </div>
      )}

      <div className="purchases-filters">
        <input
          type="text"
          placeholder="Filter by Equipment Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="purchases-input"
        />
        <input
          type="date"
          onChange={(e) => setFilterDate(e.target.value)}
          className="purchases-input"
        />
        <button onClick={fetchPurchases} className="purchases-button">Apply Filters</button>
      </div>

      <table className="purchases-table">
        <thead>
          <tr>
            <th>Equipment</th>
            <th>Quantity</th>
            <th>Base</th>
            <th>Date</th>
            {role === 'commander' && <th>Update</th>}
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => (
            <tr key={p._id}>
              <td>{p.equipmentType}</td>
              <td>
                {editingId === p._id ? (
                  <input
                    type="number"
                    value={editingQuantity}
                    onChange={(e) => setEditingQuantity(e.target.value)}
                    className="purchases-input-small"
                  />
                ) : (
                  p.quantity
                )}
              </td>
              <td>{p.base}</td>
              <td>{p.date?.slice(0, 10)}</td>
              {role === 'commander' && (
                <td>
                  {editingId === p._id ? (
                    <button onClick={() => handleUpdate(p._id)} className="purchases-button">Save</button>
                  ) : (
                    <button onClick={() => {
                      setEditingId(p._id);
                      setEditingQuantity(p.quantity);
                    }} className="purchases-button">Edit</button>
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

export default Purchases;
