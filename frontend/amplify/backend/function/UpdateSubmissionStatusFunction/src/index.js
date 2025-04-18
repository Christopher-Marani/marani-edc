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
  const { id } = event.pathParameters || {};
  const { status } = JSON.parse(event.body);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'UPDATE FormSubmissions SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Submission not found' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
    await client.query('COMMIT');
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0]),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating submission status:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  } finally {
    client.release();
  }
};