const Dispute = require("../models/Dispute");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const { logAudit } = require("../utils/auditLogger");

// @desc    Create new dispute
// @route   POST /api/disputes
// @access  Private (Customer)
exports.createDispute = async (req, res, next) => {
  try {
    const { bookingId, reason, description, attachments } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const disputeNumber = "DISP-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    const dispute = await Dispute.create({
      disputeNumber,
      booking: bookingId,
      customer: req.user.id,
      provider: booking.provider,
      reason,
      description,
      attachments: attachments || [],
      status: "OPEN",
    });

    // Mark booking as disputed
    booking.status = "DISPUTED";
    await booking.save();

    await Notification.create({
      user: booking.provider,
      title: "Dispute Raised",
      message: `A dispute was raised for Booking ${booking.bookingNumber}. Support is reviewing the matter.`,
      type: "DISPUTE",
      referenceId: dispute._id,
    });

    res.status(201).json({
      success: true,
      data: dispute,
      message: "Dispute ticket created. Our support team will investigate promptly.",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all disputes (Support Agent / Admin / Customer)
// @route   GET /api/disputes
// @access  Private
exports.getDisputes = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "CUSTOMER") {
      query.customer = req.user.id;
    } else if (req.user.role === "PROVIDER") {
      query.provider = req.user.id;
    }

    const disputes = await Dispute.find(query)
      .populate("customer", "name email phone")
      .populate("provider", "name email phone")
      .populate("booking")
      .populate("assignedAgent", "name email")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: disputes.length,
      data: disputes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dispute by ID
// @route   GET /api/disputes/:id
// @access  Private
exports.getDisputeById = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate("customer", "name email phone avatar")
      .populate("provider", "name email phone avatar")
      .populate("booking")
      .populate("assignedAgent", "name");

    if (!dispute) {
      return res.status(404).json({ success: false, message: "Dispute not found" });
    }

    res.status(200).json({
      success: true,
      data: dispute,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update dispute status / resolution (Support Agent / Admin)
// @route   PUT /api/disputes/:id/resolve
// @access  Private (Support Agent, Admin)
exports.resolveDispute = async (req, res, next) => {
  try {
    const { status, resolution } = req.body;
    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({ success: false, message: "Dispute not found" });
    }

    const oldStatus = dispute.status;
    dispute.status = status || "RESOLVED";
    if (resolution) dispute.resolution = resolution;
    dispute.assignedAgent = req.user.id;
    await dispute.save();

    await logAudit({
      actorId: req.user.id,
      action: "DISPUTE_RESOLVED",
      entity: "Dispute",
      entityId: dispute._id,
      oldValue: { status: oldStatus },
      newValue: { status: dispute.status, resolution },
    });

    res.status(200).json({
      success: true,
      data: dispute,
      message: `Dispute marked as ${dispute.status}`,
    });
  } catch (err) {
    next(err);
  }
};
