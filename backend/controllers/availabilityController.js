const Availability = require("../models/Availability");
const Booking = require("../models/Booking");

const defaultDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const defaultSlots = [
  { start: "09:00", end: "13:00", isBooked: false },
  { start: "14:00", end: "18:00", isBooked: false },
];

// @desc    Get provider availability
// @route   GET /api/availability/:providerId
// @access  Public
exports.getAvailability = async (req, res, next) => {
  try {
    let schedule = await Availability.findOne({ provider: req.params.providerId });

    if (!schedule) {
      // Create a default weekly schedule if none exists yet
      schedule = await Availability.create({
        provider: req.params.providerId,
        weeklySchedule: defaultDays.map((d) => ({
          day: d,
          isActive: true,
          slots: defaultSlots,
        })),
      });
    }

    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update provider's own availability
// @route   PUT /api/availability/me
// @access  Private (Provider)
exports.updateMyAvailability = async (req, res, next) => {
  try {
    const { weeklySchedule, vacationMode, blackoutDates } = req.body;

    let schedule = await Availability.findOne({ provider: req.user.id });

    if (!schedule) {
      schedule = new Availability({ provider: req.user.id });
    }

    if (weeklySchedule) schedule.weeklySchedule = weeklySchedule;
    if (vacationMode !== undefined) schedule.vacationMode = vacationMode;
    if (blackoutDates) schedule.blackoutDates = blackoutDates;

    await schedule.save();

    res.status(200).json({
      success: true,
      data: schedule,
      message: "Availability schedule updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check if a specific slot is available for booking
// @route   POST /api/availability/check
// @access  Public
exports.checkSlot = async (req, res, next) => {
  try {
    const { providerId, date, time } = req.body;

    if (!providerId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "providerId, date, and time are required",
      });
    }

    // Check if provider has an existing booking at that date and time
    const conflict = await Booking.findOne({
      provider: providerId,
      scheduledDate: date,
      scheduledTime: time,
      status: { $in: ["CONFIRMED", "PROVIDER_ASSIGNED", "SCHEDULED", "IN_PROGRESS"] },
    });

    const isAvailable = !conflict;

    res.status(200).json({
      success: true,
      available: isAvailable,
      message: isAvailable ? "Slot is open for booking" : "Provider has a booking conflict at this time",
    });
  } catch (err) {
    next(err);
  }
};
