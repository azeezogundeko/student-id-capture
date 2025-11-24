const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'EngrOgundeko';

// Hash the admin password for comparison
let hashedAdminPassword = null;

// Initialize the hashed password
async function initializeAuth() {
  hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
}

// Call initialization
initializeAuth();

/**
 * Verify admin password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
async function verifyAdminPassword(password) {
  if (!hashedAdminPassword) {
    await initializeAuth();
  }

  // For development, also allow direct comparison
  if (password === ADMIN_PASSWORD) {
    return true;
  }

  return await bcrypt.compare(password, hashedAdminPassword);
}

/**
 * Generate JWT token
 * @param {object} payload
 * @returns {string}
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h', // Token expires in 24 hours
  });
}

/**
 * Verify JWT token
 * @param {string} token
 * @returns {object|null}
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Admin authentication middleware
 */
function adminAuthMiddleware(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Check if it's an admin token
    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      });
    }

    // Attach user info to request
    req.admin = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

module.exports = {
  verifyAdminPassword,
  generateToken,
  verifyToken,
  adminAuthMiddleware,
};
