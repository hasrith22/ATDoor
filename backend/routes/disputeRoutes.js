const express = require("express");
const router = express.Router();
const {
  createDispute,
  getDisputes,
  getDisputeById,
  resolveDispute,
} = require("../controllers/disputeController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.post("/", authenticate, authorize("CUSTOMER"), createDispute);
router.get("/", authenticate, getDisputes);
router.get("/:id", authenticate, getDisputeById);
router.put("/:id/resolve", authenticate, authorize("SUPPORT_AGENT", "ADMIN"), resolveDispute);

module.exports = router;
