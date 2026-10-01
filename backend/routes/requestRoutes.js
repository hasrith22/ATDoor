const express = require("express");
const router = express.Router();
const {
  classifyText,
  createRequest,
  getMyRequests,
  getRequestById,
  getOpenRequests,
} = require("../controllers/requestController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.post("/ai-classify", classifyText);
router.post("/", authenticate, authorize("CUSTOMER", "ADMIN"), createRequest);
router.get("/my", authenticate, authorize("CUSTOMER"), getMyRequests);
router.get("/open", authenticate, authorize("PROVIDER", "OPERATIONS_MANAGER", "ADMIN"), getOpenRequests);
router.get("/:id", authenticate, getRequestById);

module.exports = router;
