const mongoose = require("mongoose");

const PricingRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
    },
    isGlobal: {
      type: Boolean,
      default: false,
    },
    basePrice: {
      type: Number,
      required: true,
      default: 399,
    },
    visitFee: {
      type: Number,
      default: 99,
    },
    minimumServiceCharge: {
      type: Number,
      default: 199,
    },
    emergencySurcharge: {
      type: Number,
      default: 150, // Added if urgency === "high"
    },
    weekendMultiplier: {
      type: Number,
      default: 1.1, // 10% weekend surge
    },
    peakHourMultiplier: {
      type: Number,
      default: 1.15, // 15% peak hour surge
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PricingRule", PricingRuleSchema);
