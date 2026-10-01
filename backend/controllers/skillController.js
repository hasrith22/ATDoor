const Skill = require("../models/Skill");
const { logAudit } = require("../utils/auditLogger");

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
exports.getSkills = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { status: "ACTIVE" };
    if (category) query.category = category;

    const skills = await Skill.find(query).populate("category", "name slug").sort("name");

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create skill
// @route   POST /api/skills
// @access  Private (Admin)
exports.createSkill = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;

    const skill = await Skill.create({ name, description, category });

    await logAudit({
      actorId: req.user.id,
      action: "SKILL_CREATED",
      entity: "Skill",
      entityId: skill._id,
      newValue: skill,
    });

    res.status(201).json({
      success: true,
      data: skill,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private (Admin)
exports.updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    res.status(200).json({
      success: true,
      data: skill,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private (Admin)
exports.deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, { status: "INACTIVE" }, { new: true });
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    res.status(200).json({
      success: true,
      message: "Skill deactivated",
    });
  } catch (err) {
    next(err);
  }
};
