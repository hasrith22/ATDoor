const AuditLog = require("../models/AuditLog");

const logAudit = async ({ actorId, action, entity, entityId, oldValue, newValue, details, ip }) => {
  try {
    await AuditLog.create({
      actor: actorId,
      action,
      entity,
      entityId: entityId ? String(entityId) : null,
      oldValue,
      newValue,
      details,
      ip: ip || "127.0.0.1",
    });
  } catch (error) {
    console.error("[AuditLogger] Failed to write audit log:", error.message);
  }
};

module.exports = { logAudit };
