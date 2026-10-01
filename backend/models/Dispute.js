const mongoose = require("mongoose");

const DisputeSchema = new mongoose.Schema(
  {
    disputeNumber: {
      type: String,
      required: true,
      unique: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "Poor Service",
        "Incomplete Service",
        "Incorrect Charge",
        "Provider No-show",
        "Damaged Property",
        "Other",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    attachments: [String],
    status: {
      type: String,
      enum: [
        "OPEN",
        "UNDER_REVIEW",
        "WAITING_FOR_CUSTOMER",
        "WAITING_FOR_PROVIDER",
        "RESOLVED",
        "REJECTED",
      ],
      default: "OPEN",
      index: true,
    },
    resolution: {
      type: String,
      default: "",
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Dispute", DisputeSchema);
