import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import AdminDashboard from './components/AdminDashboard';
import DataEntryDashboard from './components/DataEntryDashboard';
import PIDashboard from './components/PIDashboard';

function App() {
  const { user } = useAuthenticator((context) => [context.user]);
  if (!user) return null;

  const group = user.signInUserSession.idToken.payload['cognito:groups']?.[0];

  switch (group) {
    case 'Admin':
      return <AdminDashboard />;
    case 'DataEntry':
      return <DataEntryDashboard />;
    case 'PI':
      return <PIDashboard />;
    default:
      return <div>Unauthorized</div>;
  }
}

export default App;