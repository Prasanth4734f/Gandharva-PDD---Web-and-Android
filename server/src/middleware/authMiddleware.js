const { supabase } = require('../services/supabase');
const logger = require('../utils/logger');

/**
 * authMiddleware.js
 * 3-Tier Enterprise Role-Based Access Control (RBAC):
 * - Roles: 'admin', 'moderator', 'user'
 */

/**
 * Authenticates user bearer token via Supabase
 */
const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    
    // Check if master bypass key for local admin dev
    if (process.env.ADMIN_SECRET && token === process.env.ADMIN_SECRET) {
      req.user = {
        id: 'admin-master-local',
        email: process.env.ADMIN_EMAIL || 'admin@gandharva.ai',
        role: 'admin'
      };
      return next();
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Session expired' });
    }

    // Determine user role (defaults to 'user' if not explicitly set)
    let role = user.app_metadata?.role || user.user_metadata?.role || 'user';
    
    // Master email is always Admin
    if (user.email && process.env.ADMIN_EMAIL && user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
      role = 'admin';
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: role,
      raw: user
    };

    next();
  } catch (err) {
    logger.error(`[Auth Middleware] Verification failed: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Authentication service error' });
  }
};

/**
 * Enforces role restrictions
 * @param {Array<string>} allowedRoles e.g. ['admin'] or ['admin', 'moderator']
 */
const requireRole = (allowedRoles = ['admin']) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: No user session' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Requires one of [${allowedRoles.join(', ')}] role. Current role: ${req.user.role}`
      });
    }

    next();
  };
};

module.exports = {
  verifyAuth,
  requireRole
};
