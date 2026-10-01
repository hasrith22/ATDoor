const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("../controllers/auditLogController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.get("/", authenticate, authorize("ADMIN"), getAuditLogs);

module.exports = router;
