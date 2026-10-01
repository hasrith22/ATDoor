const mongoose = require("mongoose");

const QuoteSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    estimatedPrice: {
      type: Number,
      required: true,
    },
    visitCharge: {
      type: Number,
      default: 99,
    },
    estimatedDuration: {
      type: String,
      default: "1-2 hours",
    },
    message: {
      type: String,
      default: "",
    },
    availableDate: {
      type: String,
      required: true,
    },
    availableTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED", "WITHDRAWN"],
      default: "PENDING",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quote", QuoteSchema);
