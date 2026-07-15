const { HttpError } = require('./response');

function parseJsonBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    throw new HttpError(400, 'Invalid JSON body');
  }
}

function parseBody(schema, event) {
  const body = parseJsonBody(event);
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new HttpError(400, message || 'Invalid request body');
  }
  return result.data;
}

function parseQuery(schema, event) {
  const result = schema.safeParse(event.queryStringParameters || {});
  if (!result.success) {
    const message = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new HttpError(400, message || 'Invalid query parameters');
  }
  return result.data;
}

module.exports = { parseJsonBody, parseBody, parseQuery };
