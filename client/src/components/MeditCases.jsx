import React, { useEffect, useState } from 'react';

export default function MeditCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://192.168.86.40:5000/api/medit/cases')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setCases(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading Medit cases...</p>;
  if (error) return <p>Error: {error}</p>;

  const pendingCases = cases.filter(
    (item) => item.status && item.status.toLowerCase() === 'pending'
  );

  return (
    <div>
      <h2>Medit Cases</h2>
      {pendingCases.length === 0 ? (
        <p>No Medit cases found.</p>
      ) : (
        <ul>
          {pendingCases.map((item) => (
            <li key={item.id}>
              <strong>Doctor:</strong> {item.clinicName}<br />
              <strong>Practice:</strong> {item.clinicName === 'Uncasville Dental Associates' ? 'Dr. Krutiben Patel' : "Unknown Doctor"}<br />
              <strong>Patient:</strong> {item.caseName.split('(')[0].trim() || 'N/A'}<br />
              <strong>Received Date:</strong> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}<br />
              <strong>Due Date:</strong> {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}<br />
              <strong>Procedure:</strong> {"Unknown"}<br />
              <strong>Order ID:</strong> {item.orderId}<br />
              <strong>Status:</strong> {item.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
