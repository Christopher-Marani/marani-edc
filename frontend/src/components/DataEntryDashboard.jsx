import React, { useEffect, useState } from 'react';
import { get } from '@aws-amplify/api-rest'; // Updated import

function DataEntryDashboard({ signOut, children }) {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await get('formsApi', '/forms');
        setForms(response);
      } catch (error) {
        console.error('Error fetching forms:', error);
      }
    };
    fetchForms();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Marani EDC - Data Entry Dashboard</h1>
      <button onClick={signOut}>Sign Out</button>
      <select onChange={(e) => setSelectedForm(forms[e.target.value])}>
        <option value="">Select a form</option>
        {forms.map((form, idx) => (
          <option key={form.id} value={idx}>{form.name}</option>
        ))}
      </select>
      {selectedForm && children ? (
        React.cloneElement(children, { form_id: selectedForm.id })
      ) : (
        <p>Please select a form to submit data.</p>
      )}
    </div>
  );
}

export default DataEntryDashboard;