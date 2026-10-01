const Booking = require("../models/Booking");
const Job = require("../models/Job");
const Invoice = require("../models/Invoice");
const Notification = require("../models/Notification");
const { canTransitionBooking } = require("../utils/statusMachines");
const { logAudit } = require("../utils/auditLogger");

// @desc    Create direct booking with availability check
// @route   POST /api/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res, next) => {
  try {
    const {
      providerId,
      categoryId,
      serviceName,
      scheduledDate,
      scheduledTime,
      address,
      price,
      notes,
    } = req.body;

    // Check for double booking conflict
    const conflict = await Booking.findOne({
      provider: providerId,
      scheduledDate,
      scheduledTime,
      status: { $in: ["CONFIRMED", "PROVIDER_ASSIGNED", "SCHEDULED", "IN_PROGRESS"] },
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "The provider is already booked for this requested date and time slot.",
        code: "BOOKING_CONFLICT",
      });
    }

    const bookingNumber = "ATD-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);
    const booking = await Booking.create({
      bookingNumber,
      customer: req.user.id,
      provider: providerId,
      category: categoryId,
      serviceName,
      scheduledDate,
      scheduledTime,
      address,
      price,
      status: "CONFIRMED",
      eta: "On schedule",
      notes: notes || "",
    });

    // Create corresponding Job
    await Job.create({
      booking: booking._id,
      provider: providerId,
      customer: req.user.id,
      status: "ASSIGNED",
    });

    // Create Invoice
    const invoiceNumber = "INV-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);
    await Invoice.create({
      invoiceNumber,
      booking: booking._id,
      customer: req.user.id,
      provider: providerId,
      serviceName,
      basePrice: price,
      finalAmount: price,
      paymentStatus: "ISSUED",
    });

    // Notify Provider and Customer
    await Notification.create({
      user: providerId,
      title: "New Booking Received",
      message: `You have a new booking (${bookingNumber}) for ${serviceName} on ${scheduledDate} at ${scheduledTime}.`,
      type: "BOOKING",
      referenceId: booking._id,
    });

    await Notification.create({
      user: req.user.id,
      title: "Booking Confirmed",
      message: `Your appointment for ${serviceName} is confirmed for ${scheduledDate} at ${scheduledTime}.`,
      type: "BOOKING",
      referenceId: booking._id,
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get customer's bookings (with grouped active, upcoming, completed)
// @route   GET /api/bookings/my
// @access  Private (Customer)
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate("provider", "name email phone avatar")
      .populate("category")
      .sort("-createdAt");

    const active = bookings.filter((b) => ["IN_PROGRESS", "PROVIDER_ASSIGNED"].includes(b.status));
    const upcoming = bookings.filter((b) => ["CONFIRMED", "SCHEDULED", "PENDING"].includes(b.status));
    const completed = bookings.filter((b) => b.status === "COMPLETED");
    const cancelled = bookings.filter((b) => b.status === "CANCELLED");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: {
        all: bookings,
        active,
        upcoming,
        completed,
        cancelled,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings (Admin / Operations Manager)
// @route   GET /api/bookings
// @access  Private (Admin, Operations Manager)
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, date, search, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) query.status = status;
    if (date) query.scheduledDate = date;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate("customer", "name email phone avatar")
      .populate("provider", "name email phone avatar")
      .populate("category")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer", "name email phone avatar")
      .populate("provider", "name email phone avatar")
      .populate("category");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking status (validated with status machine)
// @route   PUT /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Role check and status transition validation
    if (!canTransitionBooking(booking.status, status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${booking.status}' to '${status}'.`,
        code: "INVALID_STATUS_TRANSITION",
      });
    }

    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();

    await logAudit({
      actorId: req.user.id,
      action: "BOOKING_STATUS_UPDATED",
      entity: "Booking",
      entityId: booking._id,
      oldValue: { status: oldStatus },
      newValue: { status },
    });

    res.status(200).json({
      success: true,
      data: booking,
      message: `Booking status changed to ${status}`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (["COMPLETED", "CANCELLED"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already ${booking.status.toLowerCase()}`,
      });
    }

    booking.status = "CANCELLED";
    booking.cancellationReason = reason || "Cancelled by user";
    booking.cancelledBy = req.user.id;
    await booking.save();

    await logAudit({
      actorId: req.user.id,
      action: "BOOKING_CANCELLED",
      entity: "Booking",
      entityId: booking._id,
      details: reason,
    });

    res.status(200).json({
      success: true,
      data: booking,
      message: "Booking cancelled successfully",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign or reassign provider (Operations Manager / Admin)
// @route   PUT /api/bookings/:id/assign
// @access  Private (Operations Manager, Admin)
exports.assignProvider = async (req, res, next) => {
  try {
    const { providerId, reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const previousProvider = booking.provider;
    booking.provider = providerId;
    booking.status = "PROVIDER_ASSIGNED";
    await booking.save();

    // Update Job record as well
    await Job.findOneAndUpdate({ booking: booking._id }, { provider: providerId });

    await logAudit({
      actorId: req.user.id,
      action: "BOOKING_REASSIGNMENT",
      entity: "Booking",
      entityId: booking._id,
      oldValue: { provider: previousProvider },
      newValue: { provider: providerId },
      details: reason,
    });

    res.status(200).json({
      success: true,
      data: booking,
      message: "Provider assigned successfully",
    });
  } catch (err) {
    next(err);
  }
};
