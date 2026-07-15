// Consistent JSON responses + a single try/catch wrapper for every handler,
// since Netlify Functions have no middleware chain to hang this off of.

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

function json(body, statusCode = 200) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify(body),
  };
}

function ok(body, statusCode = 200) {
  return json(body, statusCode);
}

function withHandler(fn) {
  return async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }
    try {
      return await fn(event, context);
    } catch (err) {
      if (err instanceof HttpError) {
        return json({ error: err.message }, err.statusCode);
      }
      console.error(err);
      return json({ error: 'Internal server error' }, 500);
    }
  };
}

module.exports = { ok, json, withHandler, HttpError };
