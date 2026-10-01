const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["ASSIGNED", "ON_THE_WAY", "STARTED", "PAUSED", "COMPLETED", "CANCELLED"],
      default: "ASSIGNED",
      index: true,
    },
    startedAt: Date,
    completedAt: Date,
    beforePhotos: {
      type: [String],
      default: [],
    },
    afterPhotos: {
      type: [String],
      default: [],
    },
    jobNotes: {
      type: String,
      default: "",
    },
    customerConfirmation: {
      confirmed: { type: Boolean, default: false },
      confirmedAt: Date,
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", JobSchema);
