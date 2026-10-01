const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", authenticate, authorize("ADMIN"), createCategory);
router.put("/:id", authenticate, authorize("ADMIN"), updateCategory);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteCategory);

module.exports = router;
