const express = require("express");
const router = express.Router();
const {
  getPricingRules,
  createPricingRule,
  updatePricingRule,
  calculatePrice,
} = require("../controllers/pricingController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.get("/", getPricingRules);
router.post("/calculate", calculatePrice);
router.post("/", authenticate, authorize("ADMIN"), createPricingRule);
router.put("/:id", authenticate, authorize("ADMIN"), updatePricingRule);

module.exports = router;
