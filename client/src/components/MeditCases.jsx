import React, { useEffect, useState } from 'react';

export default function MeditCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [downloadingId, setDownloadingId] = useState(null); // track which case is downloading

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/medit/cases`)
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
  if (error) {return <p>Error: {error}</p>;}

  const pendingCases = cases.filter(
    (item) => item.status && item.status.toLowerCase() === 'pending'
  );

  const handleDownload = async (orderId) => {
    setDownloadingId(orderId);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/medit/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Download failed");
      alert(`Scan for Order ${orderId} downloaded successfully!`);
    } catch (err) {
      console.error(err);
      alert(`Failed to download scan for Order ${orderId}.`);
    } finally {
      setDownloadingId(null);
    }
  };

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
              <strong>Status:</strong> {item.status}<br />
               <button
                onClick={() => handleDownload(item.orderId)}
                disabled={downloadingId === item.orderId}
              >
                {downloadingId === item.orderId ? "Downloading..." : "Download Scan"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
