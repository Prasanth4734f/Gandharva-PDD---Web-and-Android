const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAuth, requireRole } = require('../middleware/authMiddleware');

/**
 * 3-Tier Enterprise Admin Routes
 * - 'admin': Full System Access
 * - 'moderator': Telemetry & Audit Logs Access
 * - 'user': Regular client
 */

// 1. Telemetry & Health (Admin + Moderator)
router.get('/health', verifyAuth, requireRole(['admin', 'moderator']), adminController.getSystemHealth);

// 2. Audit Ledger & Copyright Hashes (Admin + Moderator)
router.get('/audit-logs', verifyAuth, requireRole(['admin', 'moderator']), adminController.getAuditLogs);

// 3. User Directory & Role Promotion (Admin Only)
router.get('/users', verifyAuth, requireRole(['admin']), adminController.getUsersList);
router.patch('/users/:id/role', verifyAuth, requireRole(['admin']), adminController.updateUserRole);
router.patch('/users/:id/ban', verifyAuth, requireRole(['admin']), adminController.toggleUserBan);

// 4. System Maintenance & Config (Admin Only)
router.post('/maintenance', verifyAuth, requireRole(['admin']), adminController.toggleMaintenanceMode);

module.exports = router;
