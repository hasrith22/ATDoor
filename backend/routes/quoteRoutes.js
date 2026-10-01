const express = require("express");
const router = express.Router();
const {
  submitQuote,
  getQuotesForRequest,
  acceptQuote,
} = require("../controllers/quoteController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.post("/", authenticate, authorize("PROVIDER"), submitQuote);
router.get("/request/:requestId", authenticate, getQuotesForRequest);
router.put("/:id/accept", authenticate, authorize("CUSTOMER", "ADMIN"), acceptQuote);

module.exports = router;
