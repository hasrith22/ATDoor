const mongoose = require("mongoose");

const ServiceRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
    },
    title: {
      type: String,
      default: "Home Service Request",
    },
    description: {
      type: String,
      required: [true, "Problem description is required"],
    },
    address: {
      addressLine: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, default: "Bengaluru" },
      pincode: { type: String },
    },
    preferredDate: {
      type: String,
      required: true,
    },
    preferredTime: {
      type: String,
      required: true,
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    budget: {
      type: Number,
    },
    attachments: [String],
    aiClassification: {
      categoryName: String,
      requiredSkills: [String],
      possibleIssues: [String],
      urgency: String,
      confidence: Number,
      analyzedAt: Date,
    },
    status: {
      type: String,
      enum: [
        "CREATED",
        "AI_CLASSIFIED",
        "PROVIDER_SEARCH",
        "QUOTES_RECEIVED",
        "PROVIDER_SELECTED",
        "SCHEDULED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "DISPUTED",
      ],
      default: "CREATED",
      index: true,
    },
    selectedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    selectedQuote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quote",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ServiceRequest", ServiceRequestSchema);
