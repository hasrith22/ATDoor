const mongoose = require("mongoose");

const TimeSlotSchema = new mongoose.Schema({
  start: { type: String, required: true }, // "09:00"
  end: { type: String, required: true },   // "13:00"
  isBooked: { type: Boolean, default: false },
});

const DayAvailabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true,
  },
  isActive: { type: Boolean, default: true },
  slots: [TimeSlotSchema],
});

const AvailabilitySchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    weeklySchedule: [DayAvailabilitySchema],
    vacationMode: {
      type: Boolean,
      default: false,
    },
    blackoutDates: [Date],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Availability", AvailabilitySchema);
