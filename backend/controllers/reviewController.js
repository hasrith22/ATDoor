const Review = require("../models/Review");
const Booking = require("../models/Booking");
const ProviderProfile = require("../models/ProviderProfile");

// @desc    Submit review for completed booking
// @route   POST /api/reviews
// @access  Private (Customer)
exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, review, serviceQuality, punctuality, professionalism } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "You can only review a booking that has been marked as COMPLETED.",
        code: "BOOKING_NOT_COMPLETED",
      });
    }

    if (String(booking.customer) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You can only review your own bookings.",
      });
    }

    // Check duplicate
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this service booking.",
        code: "DUPLICATE_REVIEW",
      });
    }

    const newReview = await Review.create({
      booking: bookingId,
      customer: req.user.id,
      provider: booking.provider,
      rating: Number(rating),
      review: review || "",
      serviceQuality: serviceQuality || 5,
      punctuality: punctuality || 5,
      professionalism: professionalism || 5,
    });

    // Recalculate Provider's aggregate rating and total reviews
    const allProviderReviews = await Review.find({ provider: booking.provider });
    const avgRating =
      allProviderReviews.reduce((sum, r) => sum + r.rating, 0) / (allProviderReviews.length || 1);

    await ProviderProfile.findOneAndUpdate(
      { user: booking.provider },
      {
        rating: Number(avgRating.toFixed(1)),
        totalReviews: allProviderReviews.length,
      }
    );

    res.status(201).json({
      success: true,
      data: newReview,
      message: "Review submitted successfully. Thank you for your feedback!",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
exports.getProviderReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate("customer", "name avatar")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};
