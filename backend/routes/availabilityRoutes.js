const express = require("express");
const router = express.Router();
const {
  getAvailability,
  updateMyAvailability,
  checkSlot,
} = require("../controllers/availabilityController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.post("/check", checkSlot);
router.get("/:providerId", getAvailability);
router.put("/me", authenticate, authorize("PROVIDER"), updateMyAvailability);

module.exports = router;
