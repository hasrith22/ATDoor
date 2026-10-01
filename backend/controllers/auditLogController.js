const AuditLog = require("../models/AuditLog");

// @desc    Get audit logs
// @route   GET /api/audit-logs
// @access  Private (Admin only)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, entity, page = 1, limit = 30 } = req.query;

    let query = {};
    if (action) query.action = action;
    if (entity) query.entity = entity;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate("actor", "name email role")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};
