const mongoose = require("mongoose");

const CustomerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    addresses: [
      {
        label: { type: String, default: "Home" }, // Home, Work, Other
        addressLine: { type: String, required: true },
        area: { type: String, required: true },
        city: { type: String, default: "Bengaluru" },
        pincode: { type: String },
        isDefault: { type: Boolean, default: false },
      },
    ],
    preferredLanguage: {
      type: String,
      default: "English",
    },
    emergencyContact: {
      name: String,
      phone: String,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CustomerProfile", CustomerProfileSchema);
