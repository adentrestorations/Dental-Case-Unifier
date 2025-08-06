import React from 'react';
import MeditCases from './components/MeditCases';
import IteroCases from './components/IteroCases';
import Shining3DCases from './components/Shining3DCases';

function App() {
  return (
    <div className="App">
      <h1>Dental Case Unifier Dashboard</h1>
      <MeditCases />
      <hr />
      <IteroCases /> {/* ✅ Add this line */}
      <hr />
      <Shining3DCases />
    </div>
  );
}

export default App;
