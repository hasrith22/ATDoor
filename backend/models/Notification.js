const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["REQUEST", "QUOTE", "BOOKING", "JOB", "DISPUTE", "PAYMENT", "SYSTEM"],
      default: "SYSTEM",
    },
    read: {
      type: Boolean,
      default: false,
    },
    referenceId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);
