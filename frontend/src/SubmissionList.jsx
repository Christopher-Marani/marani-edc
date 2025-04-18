import React, { useState } from 'react';
import { get, put } from '@aws-amplify/api-rest'; // Updated import

const SubmissionList = () => {
  const [submission, setSubmission] = useState(null);
  const [submissionId, setSubmissionId] = useState('');

  const fetchSubmission = async () => {
    try {
      const response = await get('submissionApi', `/submissions/${submissionId}`);
      setSubmission(response);
    } catch (error) {
      console.error('Error fetching submission:', error);
      alert('Error fetching submission');
    }
  };

  const handleApprove = async () => {
    try {
      const response = await put('submissionApi', `/submissions/${submissionId}/status`, {
        body: { status: 'approved' },
      });
      console.log('Approval successful:', response);
      alert('Submission approved!');
      fetchSubmission(); // Refresh the submission data
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('Error approving submission');
    }
  };

  return (
    <div>
      <h3>View Submissions</h3>
      <div>
        <label>
          Submission ID:
          <input
            type="text"
            value={submissionId}
            onChange={(e) => setSubmissionId(e.target.value)}
          />
        </label>
        <button onClick={fetchSubmission}>Fetch Submission</button>
      </div>
      {submission && (
        <div>
          <h4>Submission Details</h4>
          <p>ID: {submission.id}</p>
          <p>Form ID: {submission.form_id}</p>
          <p>Submitted By: {submission.submitted_by}</p>
          <p>Status: {submission.status}</p>
          <p>Data: {JSON.stringify(submission.data)}</p>
          {submission.status !== 'approved' && (
            <button onClick={handleApprove}>Approve</button>
          )}
        </div>
      )}
    </div>
  );
};

export default SubmissionList;