/* global process */
import jwt from 'jsonwebtoken';

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'super-secret-key-12345')) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is missing or insecure in production mode!');
  process.exit(1);
}

export const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-12345';

export const authMiddleware = (req, res, next) => {
  // Allow read-only guest access for all GET endpoints
  if (req.method === 'GET') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Access token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
  }
};
