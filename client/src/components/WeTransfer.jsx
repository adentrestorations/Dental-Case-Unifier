import React, { useEffect, useState } from 'react';

function WeTransferCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://192.168.86.40:5000/api/wetransfer/cases')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setCases(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading WeTransfer cases...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>WeTransfer Cases</h2>
      {cases.length === 0 ? (
        <p>No WeTransfer cases found.</p>
      ) : (
        <ul>
          {cases.map((c, i) => (
            <li key={i}>
              <strong>Subject:</strong> {c.subject} <br />
              <strong>Sender:</strong> {c.sender} <br />
              <strong>Date:</strong> {c.date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WeTransferCases;
