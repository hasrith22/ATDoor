const mongoose = require("mongoose");

const ServiceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    icon: {
      type: String,
      default: "Wrench",
    },
    image: {
      type: String,
      default: "",
    },
    basePrice: {
      type: Number,
      required: true,
      default: 399,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    requiredSkills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
    options: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

ServiceCategorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  }
  next();
});

module.exports = mongoose.model("ServiceCategory", ServiceCategorySchema);
