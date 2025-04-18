import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { post } from '@aws-amplify/api-rest'; // Updated import

function AdminDashboard({ signOut }) {
  const { register, handleSubmit, reset } = useForm();
  const [fields, setFields] = useState([]);

  const addField = () => {
    setFields([...fields, { field_name: '', field_type: 'text', is_required: false }]);
  };

  const updateField = (index, key, value) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const onSubmit = async (data) => {
    try {
      const response = await post('formsApi', '/forms', {
        body: { ...data, fields },
      });
      console.log('Form created:', response);
      alert('Form created successfully!');
      reset();
      setFields([]);
    } catch (error) {
      console.error('Error creating form:', error);
      alert('Failed to create form.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Marani EDC - Admin Dashboard</h1>
      <button onClick={signOut}>Sign Out</button>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>
          Form Name:
          <input {...register('name')} placeholder="Form Name" required />
        </label>
        <br />
        <label>
          Description:
          <textarea {...register('description')} placeholder="Description" />
        </label>
        <h3>Fields</h3>
        {fields.map((field, index) => (
          <div key={index}>
            <label>
              Field Name:
              <input
                placeholder="Field Name"
                value={field.field_name}
                onChange={(e) => updateField(index, 'field_name', e.target.value)}
                required
              />
            </label>
            <label>
              Field Type:
              <select
                value={field.field_type}
                onChange={(e) => updateField(index, 'field_type', e.target.value)}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={field.is_required}
                onChange={(e) => updateField(index, 'is_required', e.target.checked)}
              />
              Required
            </label>
          </div>
        ))}
        <br />
        <button type="button" onClick={addField}>Add Field</button>
        <button type="submit">Create Form</button>
      </form>
    </div>
  );
}

export default AdminDashboard;