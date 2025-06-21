// src/pages/Expenditures.js
import React, { useEffect, useState } from 'react';
import './Expenditures.css';

const Expenditures = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const assignedBase = localStorage.getItem('assignedBase');
  const [expenditures, setExpenditures] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignmentId, setAssignmentId] = useState('');
  const [quantityUsed, setQuantityUsed] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingQty, setEditingQty] = useState('');

  useEffect(() => {
    fetchAssignments();
    fetchExpenditures();
  }, []);

  const fetchAssignments = async () => {
    const res = await fetch('http://localhost:5001/api/assignments', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const filtered = role === 'commander'
      ? data.filter(a => a.base === assignedBase)
      : data;
    setAssignments(filtered);
  };

  const fetchExpenditures = async () => {
    const res = await fetch('http://localhost:5001/api/expenditures', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setExpenditures(data);
  };

  const handleAddExpenditure = async () => {
    if (!assignmentId || !quantityUsed) return alert('Fill all fields');

    const res = await fetch('http://localhost:5001/api/expenditures', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ assignmentId, quantityUsed: parseInt(quantityUsed) }),
    });

    if (res.ok) {
      setQuantityUsed('');
      fetchExpenditures();
    }
  };

  const handleEdit = async (id) => {
    const original = expenditures.find(e => e._id === id);
    if (!original) return;
    await fetch('http://localhost:5001/api/expenditures', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        assignmentId: original.assignmentId._id,
        quantityUsed: parseInt(editingQty)
      }),
    });
    setEditingId(null);
    setEditingQty('');
    fetchExpenditures();
  };

  return (
    <div className="expenditures-container">
      <h2 className="expenditures-title">💥 Expenditures</h2>

      <div className="expenditures-form">
        <select
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
          className="expenditures-select"
        >
          <option value=''>-- Assignment --</option>
          {assignments.map((a) => (
            <option key={a._id} value={a._id}>
              {a.assignedTo} - {a.equipmentType} ({a.quantity})
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Quantity Used"
          value={quantityUsed}
          onChange={(e) => setQuantityUsed(e.target.value)}
          className="expenditures-input"
        />
        <button onClick={handleAddExpenditure} className="expenditures-button">
          Add Expenditure
        </button>
      </div>

      <table className="expenditures-table">
        <thead>
          <tr>
            <th>Assigned To</th>
            <th>Equipment</th>
            <th>Quantity Used</th>
            <th>Date</th>
            {role === 'commander' && <th>Update</th>}
          </tr>
        </thead>
        <tbody>
          {expenditures.map((e) => (
            <tr key={e._id}>
              <td>{e.assignmentId?.assignedTo}</td>
              <td>{e.assignmentId?.equipmentType}</td>
              <td>
                {editingId === e._id ? (
                  <input
                    type="number"
                    value={editingQty}
                    onChange={(ev) => setEditingQty(ev.target.value)}
                    className="expenditures-input-small"
                  />
                ) : (
                  e.quantityUsed
                )}
              </td>
              <td>{e.date?.slice(0, 10)}</td>
              {role === 'commander' && (
                <td>
                  {editingId === e._id ? (
                    <button
                      onClick={() => handleEdit(e._id)}
                      className="expenditures-button"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(e._id);
                        setEditingQty(e.quantityUsed);
                      }}
                      className="expenditures-button"
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

export default Expenditures;
