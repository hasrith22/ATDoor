const ProviderProfile = require("../models/ProviderProfile");
const Booking = require("../models/Booking");
const Availability = require("../models/Availability");

/**
 * AI Provider Matching & Scoring Engine
 */
const matchProviders = async ({ categoryId, requiredSkills = [], area = "", requestedDate, requestedTime }) => {
  // 1. HARD FILTERS: Fetch all VERIFIED providers
  const query = {
    verificationStatus: "VERIFIED",
    isAvailable: true,
  };

  const providers = await ProviderProfile.find(query)
    .populate("user", "name email phone avatar isActive")
    .populate("skills")
    .populate("categories");

  // Filter out inactive users
  const activeProviders = providers.filter((p) => p.user && p.user.isActive);

  // 2. Filter out providers who have booking conflicts for requested date/time
  const eligibleProviders = [];

  for (const provider of activeProviders) {
    // Check service area
    const servesArea =
      !area ||
      provider.serviceAreas.includes("All Locations") ||
      provider.serviceAreas.some((a) => a.toLowerCase().includes(area.toLowerCase()));

    if (!servesArea) continue;

    // Check existing confirmed/in-progress bookings for date & time
    if (requestedDate && requestedTime) {
      const existingConflict = await Booking.findOne({
        provider: provider.user._id,
        scheduledDate: requestedDate,
        scheduledTime: requestedTime,
        status: { $in: ["CONFIRMED", "PROVIDER_ASSIGNED", "SCHEDULED", "IN_PROGRESS"] },
      });

      if (existingConflict) {
        continue; // Skip conflicting provider
      }
    }

    eligibleProviders.push(provider);
  }

  // 3. RANKING & SCORING ALGORITHM
  const scoredProviders = eligibleProviders.map((provider) => {
    let score = 50; // Base score
    const reasons = [];

    // Factor A: Skill Match (up to 25 points)
    const providerSkillNames = (provider.skills || []).map((s) => (typeof s === "object" ? s.name : s));
    const matchedSkills = requiredSkills.filter((reqSkill) =>
      providerSkillNames.some((ps) => ps.toLowerCase().includes(reqSkill.toLowerCase()))
    );

    if (matchedSkills.length > 0) {
      const skillScore = Math.min(25, (matchedSkills.length / Math.max(requiredSkills.length, 1)) * 25);
      score += skillScore;
      reasons.push(`Verified specialist with skills in ${matchedSkills.join(", ")}`);
    } else if (provider.categories && categoryId) {
      const categoryMatch = provider.categories.some((c) => c._id.equals(categoryId) || c.equals(categoryId));
      if (categoryMatch) {
        score += 15;
        reasons.push("Experienced in this service category");
      }
    }

    // Factor B: Rating & Reviews (up to 15 points)
    if (provider.rating >= 4.8) {
      score += 15;
      reasons.push(`Top-rated professional with ${provider.rating}★ rating (${provider.totalReviews} reviews)`);
    } else if (provider.rating >= 4.5) {
      score += 10;
      reasons.push(`Consistently rated high at ${provider.rating}★`);
    } else {
      score += 5;
    }

    // Factor C: Experience & Completed Jobs (up to 15 points)
    if (provider.experienceYears >= 5) {
      score += 10;
      reasons.push(`${provider.experienceYears}+ years of hands-on field experience`);
    } else {
      score += 5;
      reasons.push(`${provider.experienceYears} years of verified experience`);
    }

    if (provider.completedJobs > 50) {
      score += 5;
      reasons.push(`Completed ${provider.completedJobs}+ successful jobs with 0 complaints`);
    }

    // Factor D: Service Area & Proximity (up to 10 points)
    if (area && provider.serviceAreas.some((a) => a.toLowerCase().includes(area.toLowerCase()))) {
      score += 10;
      reasons.push(`Directly serves your neighborhood (${area})`);
    } else {
      score += 5;
      reasons.push("Available for booking in your city");
    }

    // Factor E: Reliability / Low cancellation (up to 5 points)
    if (provider.cancellationRate <= 2) {
      score += 5;
      reasons.push("Exceptional reliability with near-zero cancellation rate");
    }

    // Cap score at 99%
    const finalScore = Math.min(99, Math.round(score));

    return {
      provider: {
        id: provider.user._id,
        profileId: provider._id,
        name: provider.user.name,
        email: provider.user.email,
        phone: provider.user.phone,
        avatar: provider.user.avatar,
        title: provider.title,
        rating: provider.rating,
        totalReviews: provider.totalReviews,
        completedJobs: provider.completedJobs,
        experienceYears: provider.experienceYears,
        basePrice: provider.basePrice,
        minServiceCharge: provider.minServiceCharge,
        hourlyRate: provider.hourlyRate,
        responseTime: provider.responseTime,
        skills: provider.skills,
        serviceAreas: provider.serviceAreas,
        verificationStatus: provider.verificationStatus,
      },
      matchScore: finalScore,
      matchedSkills,
      reasons: reasons.slice(0, 4),
      estimatedPrice: provider.basePrice,
    };
  });

  // Sort descending by match score
  scoredProviders.sort((a, b) => b.matchScore - a.matchScore);

  return scoredProviders;
};

module.exports = { matchProviders };
