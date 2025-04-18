import React, { useEffect, useState } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { getCurrentUser } from '@aws-amplify/auth'; // Updated import
import AdminDashboard from './components/AdminDashboard';
import DataEntryDashboard from './components/DataEntryDashboard';
import PIDashboard from './components/PIDashboard';
import SubmissionForm from './SubmissionForm';
import SubmissionList from './SubmissionList';

function App() {
  const { user, signOut } = useAuthenticator((context) => [context.user, context.signOut]);
  const [userGroup, setUserGroup] = useState(null);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        // Fetch the current session to get the ID token
        const session = await getCurrentUser();
        console.log('App.jsx - Session:', session);
        console.log('App.jsx - ID Token Payload:', session.getIdToken().payload);

        // Get groups from the ID token
        const groups = session.getIdToken().payload['cognito:groups'] || [];
        console.log('App.jsx - User Groups:', groups);

        // Prioritize Admin role if present, otherwise take the first group
        const selectedGroup = groups.includes('Admin')
          ? 'Admin'
          : groups.includes('DataEntry')
          ? 'DataEntry'
          : groups.includes('PI')
          ? 'PI'
          : null;
        console.log('App.jsx - Selected Group:', selectedGroup);

        setUserGroup(selectedGroup);
      } catch (error) {
        console.error('App.jsx - Error fetching session:', error);
      }
    };

    if (user) {
      fetchUserSession();
    }
  }, [user]);

  // Log user for debugging
  console.log('App.jsx - User:', user);

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.username}</h1>
          <p>Role: {userGroup || 'None'}</p>
          <button onClick={signOut}>Sign Out</button>
          {userGroup === 'Admin' && <AdminDashboard signOut={signOut} />}
          {userGroup === 'DataEntry' && (
            <DataEntryDashboard signOut={signOut}>
              <SubmissionForm />
            </DataEntryDashboard>
          )}
          {userGroup === 'PI' && (
            <PIDashboard signOut={signOut}>
              <SubmissionList />
            </PIDashboard>
          )}
          {!userGroup && (
            <div>
              <h2>No Role Assigned</h2>
              <p>Please contact an administrator to assign you a role (Admin, DataEntry, or PI).</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h1>Marani EDC</h1>
          <p>Please sign in to continue.</p>
        </div>
      )}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Authenticator>
      <App />
    </Authenticator>
  );
}