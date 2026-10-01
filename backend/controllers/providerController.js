const ProviderProfile = require("../models/ProviderProfile");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Quote = require("../models/Quote");
const { matchProviders } = require("../ai/matchProviders");
const { logAudit } = require("../utils/auditLogger");

// @desc    Register provider with extended onboarding data
// @route   POST /api/providers/onboard
// @access  Private (Provider)
exports.onboardProvider = async (req, res, next) => {
  try {
    const {
      businessName,
      title,
      skills,
      categories,
      serviceAreas,
      experienceYears,
      description,
      basePrice,
      minServiceCharge,
      hourlyRate,
      documents,
    } = req.body;

    let profile = await ProviderProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new ProviderProfile({ user: req.user.id });
    }

    profile.businessName = businessName || profile.businessName || req.user.name;
    profile.title = title || profile.title;
    profile.skills = skills || profile.skills;
    profile.categories = categories || profile.categories;
    profile.serviceAreas = serviceAreas || profile.serviceAreas;
    profile.experienceYears = experienceYears || profile.experienceYears;
    profile.description = description || profile.description;
    profile.basePrice = basePrice || profile.basePrice;
    profile.minServiceCharge = minServiceCharge || profile.minServiceCharge;
    profile.hourlyRate = hourlyRate || profile.hourlyRate;
    if (documents) profile.documents = documents;

    // Resubmit for review if previously pending/rejected
    profile.verificationStatus = "UNDER_REVIEW";

    await profile.save();

    await logAudit({
      actorId: req.user.id,
      action: "PROVIDER_SUBMITTED_ONBOARDING",
      entity: "ProviderProfile",
      entityId: profile._id,
      newValue: { status: "UNDER_REVIEW" },
    });

    res.status(200).json({
      success: true,
      data: profile,
      message: "Onboarding information submitted successfully for verification.",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all providers with filters and pagination
// @route   GET /api/providers
// @access  Public
exports.getProviders = async (req, res, next) => {
  try {
    const { category, skill, area, minRating, maxPrice, search, page = 1, limit = 10 } = req.query;

    let query = { verificationStatus: "VERIFIED" };

    if (category) {
      query.categories = category;
    }
    if (skill) {
      query.skills = skill;
    }
    if (area && area !== "All Locations") {
      query.serviceAreas = { $in: [area, "All Locations"] };
    }
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }
    if (maxPrice) {
      query.basePrice = { $lte: Number(maxPrice) };
    }

    const total = await ProviderProfile.countDocuments(query);
    const providers = await ProviderProfile.find(query)
      .populate("user", "name email phone avatar isActive")
      .populate("skills")
      .populate("categories")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort("-rating");

    // Optional text search filter
    let results = providers;
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.user?.name?.toLowerCase().includes(s) ||
          p.title?.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s)
      );
    }

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get AI recommended providers
// @route   POST /api/providers/recommended
// @access  Public
exports.getRecommendedProviders = async (req, res, next) => {
  try {
    const { categoryId, requiredSkills, area, requestedDate, requestedTime } = req.body;

    const recommendations = await matchProviders({
      categoryId,
      requiredSkills,
      area,
      requestedDate,
      requestedTime,
    });

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single provider by ID
// @route   GET /api/providers/:id
// @access  Public
exports.getProviderById = async (req, res, next) => {
  try {
    const provider = await ProviderProfile.findOne({
      $or: [{ _id: req.params.id }, { user: req.params.id }],
    })
      .populate("user", "name email phone avatar isActive")
      .populate("skills")
      .populate("categories");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
        code: "PROVIDER_NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      data: provider,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update current provider's profile
// @route   PUT /api/providers/me
// @access  Private (Provider)
exports.updateMyProfile = async (req, res, next) => {
  try {
    let profile = await ProviderProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new ProviderProfile({ user: req.user.id });
    }

    const updatable = [
      "businessName",
      "title",
      "description",
      "serviceAreas",
      "basePrice",
      "minServiceCharge",
      "hourlyRate",
      "isAvailable",
      "skills",
      "categories",
      "experienceYears",
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile,
      message: "Profile updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current provider's earnings and stats
// @route   GET /api/providers/me/earnings
// @access  Private (Provider)
exports.getProviderEarnings = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    // Aggregate completed bookings
    const completedBookings = await Booking.find({
      provider: req.user.id,
      status: "COMPLETED",
    });

    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const platformFeeRate = 0.15; // 15% platform commission
    const netEarnings = Math.round(totalRevenue * (1 - platformFeeRate));

    const pendingJobs = await Booking.countDocuments({
      provider: req.user.id,
      status: { $in: ["CONFIRMED", "SCHEDULED", "IN_PROGRESS"] },
    });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        netEarnings,
        platformFee: Math.round(totalRevenue * platformFeeRate),
        completedJobsCount: completedBookings.length,
        pendingJobsCount: pendingJobs,
        rating: profile.rating,
        totalReviews: profile.totalReviews,
      },
    });
  } catch (err) {
    next(err);
  }
};
