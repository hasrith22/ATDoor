const mongoose = require("mongoose");

const ProviderProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      default: "Home Service Specialist",
    },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
      index: true,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceCategory",
      },
    ],
    serviceAreas: {
      type: [String],
      default: ["All Locations"],
    },
    experienceYears: {
      type: Number,
      default: 3,
    },
    description: {
      type: String,
      default: "",
    },
    basePrice: {
      type: Number,
      default: 449,
    },
    minServiceCharge: {
      type: Number,
      default: 199,
    },
    hourlyRate: {
      type: Number,
      default: 350,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    completedJobs: {
      type: Number,
      default: 0,
    },
    cancellationRate: {
      type: Number,
      default: 0,
    },
    responseTime: {
      type: String,
      default: "Responds in 10 mins",
    },
    documents: [
      {
        type: { type: String, required: true }, // e.g. "ID_PROOF", "ADDRESS_PROOF", "CERTIFICATE"
        name: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    earnings: {
      total: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      withdrawn: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProviderProfile", ProviderProfileSchema);
