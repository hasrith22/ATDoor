const express = require("express");
const router = express.Router();
const {
  getMyJobs,
  getJobById,
  updateJobStatus,
  uploadEvidence,
  confirmCompletion,
} = require("../controllers/jobController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.get("/my", authenticate, authorize("PROVIDER"), getMyJobs);
router.get("/:id", authenticate, getJobById);
router.put("/:id/status", authenticate, authorize("PROVIDER"), updateJobStatus);
router.post("/:id/evidence", authenticate, authorize("PROVIDER"), uploadEvidence);
router.post("/:id/confirm", authenticate, authorize("CUSTOMER"), confirmCompletion);

module.exports = router;
