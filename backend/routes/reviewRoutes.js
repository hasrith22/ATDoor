const express = require("express");
const router = express.Router();
const { createReview, getProviderReviews } = require("../controllers/reviewController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.post("/", authenticate, authorize("CUSTOMER"), createReview);
router.get("/provider/:providerId", getProviderReviews);

module.exports = router;
