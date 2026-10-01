const express = require("express");
const router = express.Router();
const {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} = require("../controllers/skillController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.get("/", getSkills);
router.post("/", authenticate, authorize("ADMIN"), createSkill);
router.put("/:id", authenticate, authorize("ADMIN"), updateSkill);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteSkill);

module.exports = router;
