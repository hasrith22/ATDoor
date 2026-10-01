const User = require("../models/User");
const ProviderProfile = require("../models/ProviderProfile");
const Notification = require("../models/Notification");
const { canTransitionVerification } = require("../utils/statusMachines");
const { logAudit } = require("../utils/auditLogger");

// @desc    Get all users with role filtering & pagination
// @route   GET /api/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin Provider Verification (Approve, Reject, Suspend)
// @route   PUT /api/users/provider/:id/verify
// @access  Private (Admin)
exports.verifyProvider = async (req, res, next) => {
  try {
    const { status, reason } = req.body; // status: "VERIFIED", "REJECTED", "SUSPENDED", "UNDER_REVIEW"

    const profile = await ProviderProfile.findOne({
      $or: [{ _id: req.params.id }, { user: req.params.id }],
    }).populate("user");

    if (!profile) {
      return res.status(404).json({ success: false, message: "Provider profile not found" });
    }

    if (!canTransitionVerification(profile.verificationStatus, status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${profile.verificationStatus}' to '${status}'.`,
        code: "INVALID_VERIFICATION_TRANSITION",
      });
    }

    const previousStatus = profile.verificationStatus;
    profile.verificationStatus = status;
    if (reason) profile.rejectionReason = reason;
    await profile.save();

    await logAudit({
      actorId: req.user.id,
      action: `PROVIDER_${status}`,
      entity: "ProviderProfile",
      entityId: profile._id,
      oldValue: { status: previousStatus },
      newValue: { status, reason },
      details: reason,
    });

    // Notify provider
    await Notification.create({
      user: profile.user._id,
      title: `Verification Status Updated: ${status}`,
      message:
        status === "VERIFIED"
          ? "Congratulations! Your provider profile has been approved. You are now live on AtDoor!"
          : `Your verification status was updated to ${status}. Reason: ${reason || "Profile review"}`,
      type: "SYSTEM",
      referenceId: profile._id,
    });

    res.status(200).json({
      success: true,
      data: profile,
      message: `Provider status set to ${status}`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Deactivate or activate user account
// @route   PUT /api/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await logAudit({
      actorId: req.user.id,
      action: isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
      entity: "User",
      entityId: user._id,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
