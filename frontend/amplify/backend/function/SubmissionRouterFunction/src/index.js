import AWS from 'aws-sdk';

const lambda = new AWS.Lambda();

export const handler = async (event) => {
  try {
    // Extract path and HTTP method from the event
    const path = event.path; // e.g., /submissions, /submissions/123, /submissions/123/status
    const method = event.httpMethod; // e.g., POST, GET, PUT

    console.log(`Received request: ${method} ${path}`);

    // Parse the path to determine the target Lambda function
    const pathParts = path.split('/').filter(Boolean); // Split path into parts: ["submissions", "123", "status"]
    const basePath = pathParts[0]; // "submissions"

    // Define the target Lambda function based on path and method
    let targetFunction;
    let payload = event;

    if (pathParts.length === 1 && method === 'POST') {
      // POST /submissions -> SubmitFormFunction
      targetFunction = 'SubmitFormFunction';
    } else if (pathParts.length === 2 && method === 'GET') {
      // GET /submissions/{id} -> GetSubmissionsFunction
      targetFunction = 'GetSubmissionsFunction';
      // Add the id as a path parameter
      payload = {
        ...event,
        pathParameters: { id: pathParts[1] },
      };
    } else if (pathParts.length === 3 && pathParts[2] === 'status' && method === 'PUT') {
      // PUT /submissions/{id}/status -> UpdateSubmissionStatusFunction
      targetFunction = 'UpdateSubmissionStatusFunction';
      payload = {
        ...event,
        pathParameters: { id: pathParts[1] },
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Route not found' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Invoke the target Lambda function
    const invokeParams = {
      FunctionName: targetFunction,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify(payload),
    };

    const result = await lambda.invoke(invokeParams).promise();

    // Parse the response from the target Lambda function
    const response = JSON.parse(result.Payload);

    // Ensure the response has the correct structure
    return {
      statusCode: response.statusCode || 200,
      body: typeof response.body === 'string' ? response.body : JSON.stringify(response.body),
      headers: response.headers || { 'Content-Type': 'application/json' },
    };
  } catch (err) {
    console.error('Error in router:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};