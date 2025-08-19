import React from 'react';
import MeditCases from './components/MeditCases';
import IteroCases from './components/IteroCases';
import Shining3DCases from './components/Shining3DCases';

function App() {
  return (
    <div className="App">
      <h1>Case Dashboard</h1>
      <IteroCases />
      <hr />
      <Shining3DCases />
      <hr />
      <MeditCases />
      <hr />
      <p style={{ textAlign: 'center', marginTop: '2rem', color: '#16AFD2' }}>
    Changes only show upon refresh (F5)
  </p>
    </div>
  );
}

export default App;
