const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { HttpError } = require('./response');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(payload) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Invalid or expired session. Please log in again.');
  }
}

// Returns the decoded token payload for any valid token, regardless of role.
function getAuthUser(event) {
  const header = event.headers.authorization || event.headers.Authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new HttpError(401, 'Missing authorization token');
  }
  return verifyToken(header.slice('Bearer '.length));
}

// Same, but returns null instead of throwing when there is no/invalid token -
// used by endpoints that behave differently for logged-in vs anonymous callers
// (e.g. public feedback submission auto-attaching a household).
function getAuthUserOptional(event) {
  try {
    return getAuthUser(event);
  } catch {
    return null;
  }
}

function requireRole(event, roles) {
  const user = getAuthUser(event);
  if (!roles.includes(user.role)) {
    throw new HttpError(403, 'You do not have permission to perform this action');
  }
  return user;
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  signToken,
  verifyToken,
  getAuthUser,
  getAuthUserOptional,
  requireRole,
  hashPassword,
  verifyPassword,
};
