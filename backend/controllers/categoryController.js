const ServiceCategory = require("../models/ServiceCategory");
const { logAudit } = require("../utils/auditLogger");

// @desc    Get all active service categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const { all } = req.query;
    const query = all === "true" ? {} : { status: "ACTIVE" };

    const categories = await ServiceCategory.find(query).populate("requiredSkills").sort("name");

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get category by ID or slug
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res, next) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { slug: req.params.id };

    const category = await ServiceCategory.findOne(query).populate("requiredSkills");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Service category not found",
        code: "CATEGORY_NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, image, basePrice, requiredSkills, options } = req.body;

    const category = await ServiceCategory.create({
      name,
      description,
      icon,
      image,
      basePrice,
      requiredSkills,
      options,
    });

    await logAudit({
      actorId: req.user.id,
      action: "CATEGORY_CREATED",
      entity: "ServiceCategory",
      entityId: category._id,
      newValue: category,
    });

    res.status(201).json({
      success: true,
      data: category,
      message: "Category created successfully",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await ServiceCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await logAudit({
      actorId: req.user.id,
      action: "CATEGORY_UPDATED",
      entity: "ServiceCategory",
      entityId: category._id,
      newValue: req.body,
    });

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete or deactivate category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await ServiceCategory.findByIdAndUpdate(
      req.params.id,
      { status: "INACTIVE" },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    await logAudit({
      actorId: req.user.id,
      action: "CATEGORY_DEACTIVATED",
      entity: "ServiceCategory",
      entityId: category._id,
    });

    res.status(200).json({
      success: true,
      message: "Category deactivated successfully",
    });
  } catch (err) {
    next(err);
  }
};
