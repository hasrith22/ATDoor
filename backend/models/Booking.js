const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
    },
    quote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quote",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
    },
    serviceName: {
      type: String,
      required: true,
    },
    scheduledDate: {
      type: String, // "YYYY-MM-DD" or formatted date
      required: true,
    },
    scheduledTime: {
      type: String, // e.g. "10:00 AM" or "10:00"
      required: true,
    },
    durationHours: {
      type: Number,
      default: 2,
    },
    address: {
      addressLine: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, default: "Bengaluru" },
      pincode: { type: String },
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PROVIDER_ASSIGNED",
        "SCHEDULED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "DISPUTED",
      ],
      default: "CONFIRMED",
      index: true,
    },
    eta: {
      type: String,
      default: "",
    },
    cancellationReason: {
      type: String,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", BookingSchema);
