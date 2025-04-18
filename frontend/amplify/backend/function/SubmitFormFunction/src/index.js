const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  database: process.env.DB_NAME || 'marani_edc',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_local_password',
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
});

exports.handler = async (event) => {
  const { form_id, data } = JSON.parse(event.body);
  const user = event.requestContext?.authorizer?.claims?.['cognito:username'] || 'test-user';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'INSERT INTO FormSubmissions (form_id, submitted_by, status, data) VALUES ($1, $2, $3, $4) RETURNING id',
      [form_id, user, 'submitted', data]
    );
    await client.query('COMMIT');
    return {
      statusCode: 200,
      body: JSON.stringify({ id: result.rows[0].id }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting form:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  } finally {
    client.release();
  }
};