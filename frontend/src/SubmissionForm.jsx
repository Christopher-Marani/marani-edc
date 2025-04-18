import React, { useState } from 'react';
import { post } from '@aws-amplify/api-rest'; // Updated import

const SubmissionForm = ({ form_id }) => {
  const [formData, setFormData] = useState({
    patient_name: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await post('submissionApi', '/submissions', {
        body: {
          form_id: form_id,
          data: {
            patient_name: formData.patient_name,
          },
        },
      });
      console.log('Submission successful:', response);
      alert('Form submitted successfully!');
      setFormData({ patient_name: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    }
  };

  return (
    <div>
      <h3>Submit Form (Form ID: {form_id})</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Patient Name:
          <input
            type="text"
            name="patient_name"
            value={formData.patient_name}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SubmissionForm;