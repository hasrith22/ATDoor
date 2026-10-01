const express = require("express");
const router = express.Router();
const { getAllUsers, verifyProvider, updateUserStatus } = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.get("/", authenticate, authorize("ADMIN"), getAllUsers);
router.put("/provider/:id/verify", authenticate, authorize("ADMIN"), verifyProvider);
router.put("/:id/status", authenticate, authorize("ADMIN"), updateUserStatus);

module.exports = router;
