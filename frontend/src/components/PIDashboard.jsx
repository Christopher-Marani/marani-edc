import React from 'react';

function PIDashboard({ signOut, children }) {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Marani EDC - PI Dashboard</h1>
      <button onClick={signOut}>Sign Out</button>
      {children}
    </div>
  );
}

export default PIDashboard;