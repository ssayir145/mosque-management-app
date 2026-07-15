// Neon serverless Postgres client - HTTP based, purpose-built for
// short-lived serverless function invocations (no connection pool to manage).
const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
}

const sql = neon(process.env.DATABASE_URL);

// `queries` must be an array of un-awaited `sql\`...\`` calls; the driver
// batches them into a single atomic transaction over one HTTP round trip.
function withTransaction(queries, options) {
  return sql.transaction(queries, options);
}

module.exports = { sql, withTransaction };
