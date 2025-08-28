import React, { useEffect, useState } from 'react';

function IteroCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/itero/cases`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setCases(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch cases.');
        setLoading(false);
      });
  }, []);

  const safeCases = Array.isArray(cases) ? cases : [];

  // New handler for "Download Scan" button click
  const handleDownloadClick = async (orderId) => {
    try {
      const res = await fetch(`http://192.168.86.40:5000/api/itero/printRx/${orderId}`, { method: 'GET' });
      if (!res.ok) throw new Error('Failed to trigger Print Rx');
    } catch (err) {
      alert('Error triggering Print Rx: ' + err.message);
    }
  };

  if (loading) return <p>Loading iTero cases...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>iTero Cases</h2>
      {safeCases.length === 0 ? (
        <p>No iTero cases found.</p>
      ) : (
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
          {safeCases.map((c, idx) => (
            <li
              key={idx}
              style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                border: '1px solid #ccc',
                borderRadius: '8px',
              }}
            >
              <div><strong>Doctor:</strong> {c.doctor}</div>
              <div><strong>Practice:</strong> {c.practice}</div>
              <div><strong>Patient:</strong> {c.patientName}</div>
              <div><strong>Received Date:</strong> {c.receivedDate || 'N/A'}</div>
              <div><strong>Due Date:</strong> {c.dueDate}</div>
              <div><strong>Procedure:</strong> {c.procedure}</div>
              <div><strong>Order ID:</strong> {c.orderId}</div>
              <div><strong>Status:</strong> {c.status}</div>

              {/* <button
                onClick={() => handleDownloadClick(c.orderId)}
                style={{
                  color: 'blue',
                  textDecoration: 'underline',
                  marginTop: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit',
                }}
              >
                Download Scan
              </button> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default IteroCases;
