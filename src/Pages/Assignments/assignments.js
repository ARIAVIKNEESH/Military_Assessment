import React, { useEffect, useState, useCallback } from 'react';
import './Assignments.css';

const Assignments = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const assignedBase = localStorage.getItem('assignedBase');

  const [assignments, setAssignments] = useState([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState('');
  const [allBases, setAllBases] = useState([]);
  const [selectedBase, setSelectedBase] = useState(assignedBase);
  const [filterPerson, setFilterPerson] = useState('');

  const fetchBases = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5001/api/bases', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAllBases(data);
    } catch (error) {
      console.error('Error fetching bases:', error);
    }
  }, [token]);

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5001/api/assignments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      let filtered = data;

      if (role === 'commander') {
        filtered = data.filter((a) => a.base === assignedBase);
      } else if (role === 'admin' && selectedBase) {
        filtered = data.filter((a) => a.base === selectedBase);
      }

      if (filterPerson) {
        filtered = filtered.filter((a) =>
          a.assignedTo.toLowerCase().includes(filterPerson.toLowerCase())
        );
      }

      setAssignments(filtered);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  }, [token, role, assignedBase, selectedBase, filterPerson]);

  useEffect(() => {
    if (role === 'admin') fetchBases();
    fetchAssignments();
  }, [role, fetchBases, fetchAssignments]);

  const handleAdd = async () => {
    if (!assignedTo || !equipmentType || !quantity) return alert('Fill all fields');

    const body = {
      assignedTo,
      equipmentType,
      quantity: parseInt(quantity),
      base: role === 'admin' ? selectedBase : assignedBase,
    };

    try {
      const res = await fetch('http://localhost:5001/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setAssignedTo('');
        setEquipmentType('');
        setQuantity('');
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error adding assignment:', error);
    }
  };

  const handleUpdate = async (id) => {
    const original = assignments.find((a) => a._id === id);
    if (!original) return;

    const body = {
      assignedTo: original.assignedTo,
      equipmentType: original.equipmentType,
      quantity: parseInt(editingQuantity),
      base: original.base,
    };

    try {
      const res = await fetch('http://localhost:5001/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setEditingId(null);
        setEditingQuantity('');
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  return (
    <div className="assignments-container">
      <h2 className="assignments-title">🎯 Assignments</h2>

      {role === 'admin' && (
        <div className="assignments-field">
          <label>Choose Base:</label>
          <select
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
            className="assignments-select"
          >
            <option value="">-- Select --</option>
            {allBases.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {(role === 'admin' || role === 'commander') && (
        <div className="assignments-add">
          <input
            type="text"
            placeholder="Assigned To"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="assignments-input"
          />
          <input
            type="text"
            placeholder="Equipment Type"
            value={equipmentType}
            onChange={(e) => setEquipmentType(e.target.value)}
            className="assignments-input"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="assignments-input"
          />
          <button onClick={handleAdd} className="assignments-button">
            Add Assignment
          </button>
        </div>
      )}

      <div className="assignments-filter">
        <input
          type="text"
          placeholder="Filter by Personnel"
          value={filterPerson}
          onChange={(e) => setFilterPerson(e.target.value)}
          className="assignments-input"
        />
        <button onClick={fetchAssignments} className="assignments-button">
          Apply Filter
        </button>
      </div>

      <table className="assignments-table">
        <thead>
          <tr>
            <th>Assigned To</th>
            <th>Equipment</th>
            <th>Quantity</th>
            <th>Base</th>
            <th>Date</th>
            {role === 'commander' && <th>Update</th>}
          </tr>
        </thead>
        <tbody>
          {assignments.map((a) => (
            <tr key={a._id}>
              <td>{a.assignedTo}</td>
              <td>{a.equipmentType}</td>
              <td>
                {editingId === a._id ? (
                  <input
                    type="number"
                    value={editingQuantity}
                    onChange={(e) => setEditingQuantity(e.target.value)}
                    className="assignments-input-small"
                  />
                ) : (
                  a.quantity
                )}
              </td>
              <td>{a.base}</td>
              <td>{a.date?.slice(0, 10)}</td>
              {role === 'commander' && (
                <td>
                  {editingId === a._id ? (
                    <button
                      onClick={() => handleUpdate(a._id)}
                      className="assignments-button"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(a._id);
                        setEditingQuantity(a.quantity);
                      }}
                      className="assignments-button"
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

export default Assignments;
