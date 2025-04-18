const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: 'postgres',
  user: 'admin',
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

exports.handler = async (event) => {
  const { id } = event.pathParameters;

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM FormSubmissions WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Submission not found' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0]),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Error fetching submission:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  } finally {
    client.release();
  }
};