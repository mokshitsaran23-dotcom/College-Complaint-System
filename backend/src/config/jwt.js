const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'college-complaint-jwt-supersecret-2026';

function base64url(str) {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function sign(payload, secret = JWT_SECRET, expiresInSeconds = 8 * 3600) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = base64url(JSON.stringify({ ...payload, exp }));
  const signature = crypto.createHmac('sha256', secret).update(header + '.' + body).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return header + '.' + body + '.' + signature;
}

function verify(token, secret = JWT_SECRET) {
  if (!token) throw new Error('No token provided');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token structure');
  const [header, body, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(header + '.' + body).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  if (signature !== expectedSig) throw new Error('Invalid token signature');

  const payload = JSON.parse(Buffer.from(body, 'base64').toString('utf8'));
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error('Token expired');
  }
  return payload;
}

module.exports = { sign, verify, JWT_SECRET };
