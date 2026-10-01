const express = require("express");
const router = express.Router();
const {
  getAdminAnalytics,
  getOperationsAnalytics,
} = require("../controllers/analyticsController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.get("/admin", authenticate, authorize("ADMIN"), getAdminAnalytics);
router.get("/operations", authenticate, authorize("OPERATIONS_MANAGER", "ADMIN"), getOperationsAnalytics);

module.exports = router;
