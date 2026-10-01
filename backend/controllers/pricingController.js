const PricingRule = require("../models/PricingRule");
const ServiceCategory = require("../models/ServiceCategory");
const { logAudit } = require("../utils/auditLogger");

// @desc    Get pricing rules
// @route   GET /api/pricing
// @access  Public
exports.getPricingRules = async (req, res, next) => {
  try {
    const rules = await PricingRule.find({ isActive: true }).populate("category", "name slug");
    res.status(200).json({
      success: true,
      count: rules.length,
      data: rules,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create pricing rule
// @route   POST /api/pricing
// @access  Private (Admin)
exports.createPricingRule = async (req, res, next) => {
  try {
    const rule = await PricingRule.create(req.body);

    await logAudit({
      actorId: req.user.id,
      action: "PRICING_RULE_CREATED",
      entity: "PricingRule",
      entityId: rule._id,
      newValue: rule,
    });

    res.status(201).json({
      success: true,
      data: rule,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update pricing rule
// @route   PUT /api/pricing/:id
// @access  Private (Admin)
exports.updatePricingRule = async (req, res, next) => {
  try {
    const rule = await PricingRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!rule) {
      return res.status(404).json({ success: false, message: "Rule not found" });
    }

    await logAudit({
      actorId: req.user.id,
      action: "PRICING_RULE_UPDATED",
      entity: "PricingRule",
      entityId: rule._id,
      newValue: req.body,
    });

    res.status(200).json({
      success: true,
      data: rule,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Calculate authoritative price on backend
// @route   POST /api/pricing/calculate
// @access  Public
exports.calculatePrice = async (req, res, next) => {
  try {
    const { categoryId, urgency = "medium", scheduledDate, scheduledTime } = req.body;

    let basePrice = 399;
    let visitFee = 99;
    let emergencySurcharge = 0;
    let surgeMultiplier = 1.0;

    // Check category base price
    if (categoryId) {
      const category = await ServiceCategory.findById(categoryId);
      if (category) {
        basePrice = category.basePrice;
      }
    }

    // Check custom rule for category or global
    const rule = (await PricingRule.findOne({ category: categoryId, isActive: true })) ||
      (await PricingRule.findOne({ isGlobal: true, isActive: true }));

    if (rule) {
      if (rule.basePrice) basePrice = rule.basePrice;
      if (rule.visitFee !== undefined) visitFee = rule.visitFee;
      if (urgency === "high" && rule.emergencySurcharge) {
        emergencySurcharge = rule.emergencySurcharge;
      }
    } else if (urgency === "high") {
      emergencySurcharge = 150;
    }

    // Weekend surcharge check
    if (scheduledDate) {
      const day = new Date(scheduledDate).getDay();
      if (day === 0 || day === 6) {
        // Sunday or Saturday
        surgeMultiplier += 0.1; // +10%
      }
    }

    const calculatedTotal = Math.round((basePrice + visitFee + emergencySurcharge) * surgeMultiplier);

    res.status(200).json({
      success: true,
      breakdown: {
        basePrice,
        visitFee,
        emergencySurcharge,
        surgeMultiplier,
        total: calculatedTotal,
      },
    });
  } catch (err) {
    next(err);
  }
};
