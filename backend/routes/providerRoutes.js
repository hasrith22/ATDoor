const express = require("express");
const router = express.Router();
const {
  onboardProvider,
  getProviders,
  getRecommendedProviders,
  getProviderById,
  updateMyProfile,
  getProviderEarnings,
} = require("../controllers/providerController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.get("/", getProviders);
router.post("/recommended", getRecommendedProviders);
router.get("/me/earnings", authenticate, authorize("PROVIDER"), getProviderEarnings);
router.put("/me", authenticate, authorize("PROVIDER"), updateMyProfile);
router.post("/onboard", authenticate, authorize("PROVIDER"), onboardProvider);
router.get("/:id", getProviderById);

module.exports = router;
