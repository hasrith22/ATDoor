const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  assignProvider,
} = require("../controllers/bookingController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.post("/", authenticate, authorize("CUSTOMER", "ADMIN"), createBooking);
router.get("/my", authenticate, getMyBookings);
router.get("/", authenticate, authorize("ADMIN", "OPERATIONS_MANAGER", "SUPPORT_AGENT"), getAllBookings);
router.get("/:id", authenticate, getBookingById);
router.put("/:id/status", authenticate, updateBookingStatus);
router.put("/:id/cancel", authenticate, cancelBooking);
router.put("/:id/assign", authenticate, authorize("OPERATIONS_MANAGER", "ADMIN"), assignProvider);

module.exports = router;
