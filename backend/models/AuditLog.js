const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entity: {
      type: String,
      required: true,
    },
    entityId: {
      type: String,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    details: {
      type: String,
    },
    ip: {
      type: String,
      default: "127.0.0.1",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);
