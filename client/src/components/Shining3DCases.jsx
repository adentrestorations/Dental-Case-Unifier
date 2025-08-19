import React, { useEffect, useState } from 'react';

function isRecent(receivedDateStr) {
  if (!receivedDateStr) return false;
  const receivedDate = new Date(receivedDateStr);
  const today = new Date();
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(today.getDate() - 1);

  return receivedDate >= threeDaysAgo;
}

// function isSuperRecent(receivedDateStr) {
//   if (!receivedDateStr) return false;
//   const receivedDate = new Date(receivedDateStr);
//   const today = new Date();
//   const threeDaysAgo = new Date();
//   threeDaysAgo.setDate(today.getDate() - 5);

//   return receivedDate >= threeDaysAgo;
// }


function Shining3DCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://192.168.86.40:5000/api/shining3d/cases')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setCases(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Failed to fetch Shining3D cases.');
        setLoading(false);
      });
  }, []);

  const safeCases = Array.isArray(cases) ? cases : [];

  const handleDownloadClick = async (orderId) => {
    try {
      const res = await fetch(`http://192.168.86.40:3000/api/shining3d/printRx/${orderId}`, { method: 'GET' });
      if (!res.ok) throw new Error('Failed to trigger Shining3D Print Rx');
    } catch (err) {
      alert('Error triggering Shining3D Print Rx: ' + err.message);
    }
  };

  if (loading) return <p>Loading Shining3D cases...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  // Filter for pending only, sort by receivedDate descending, then take 5
const pendingRecentCases = safeCases
  .filter(c => c.status && c.status.toLowerCase() === 'pending')
  .sort((a, b) => new Date(b.receivedDate) - new Date(a.receivedDate))
  .slice(0, 5);


  return (
    <div>
      <h2>Shining3D Cases</h2>
      {pendingRecentCases.length === 0 ? (
        <p>No Shining3D cases found.</p>
      ) : (
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
          {pendingRecentCases.map((c) => (
            <li
  key={c.orderId}
  style={{
    marginBottom: '1.5rem',
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    color: isRecent(c.receivedDate) ? 'black' : 'red',
  }}
>
              <div><strong>Doctor:</strong> {c.doctorName}</div>
              <div><strong>Practice:</strong> {c.practice}</div>
              <div><strong>Patient:</strong> {c.patientName}</div>
              <div><strong>Received Date:</strong>{' '}{c.receivedDate || 'N/A'}</div>
              <div><strong>Due Date:</strong> {c.dueDate || 'N/A'}</div>
              <div><strong>Procedure:</strong> {c.procedure}</div>
              <div><strong>Order ID:</strong> {c.orderId}</div>
              <div><strong>Status:</strong> {c.status}</div>

              <button
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
                This Button Does Nothing
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Shining3DCases;