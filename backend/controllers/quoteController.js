const Quote = require("../models/Quote");
const ServiceRequest = require("../models/ServiceRequest");
const Booking = require("../models/Booking");
const Job = require("../models/Job");
const Invoice = require("../models/Invoice");
const Notification = require("../models/Notification");
const ProviderProfile = require("../models/ProviderProfile");

// @desc    Submit a quote for a request
// @route   POST /api/quotes
// @access  Private (Provider)
exports.submitQuote = async (req, res, next) => {
  try {
    const { requestId, estimatedPrice, visitCharge, estimatedDuration, message, availableDate, availableTime } =
      req.body;

    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: "Service request not found" });
    }

    // Check if provider already submitted quote
    const existingQuote = await Quote.findOne({ request: requestId, provider: req.user.id });
    if (existingQuote) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a quote for this request",
      });
    }

    const quote = await Quote.create({
      request: requestId,
      provider: req.user.id,
      estimatedPrice,
      visitCharge: visitCharge || 99,
      estimatedDuration: estimatedDuration || "1-2 hours",
      message: message || "I am available to complete this service with professional quality guarantee.",
      availableDate: availableDate || serviceRequest.preferredDate,
      availableTime: availableTime || serviceRequest.preferredTime,
      status: "PENDING",
    });

    // Update request status to QUOTES_RECEIVED
    serviceRequest.status = "QUOTES_RECEIVED";
    await serviceRequest.save();

    // Notify customer
    await Notification.create({
      user: serviceRequest.customer,
      title: "New Quote Received",
      message: `A professional has submitted a quote of ₹${estimatedPrice} for your request.`,
      type: "QUOTE",
      referenceId: quote._id,
    });

    res.status(201).json({
      success: true,
      data: quote,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get quotes for a request (comparison UI)
// @route   GET /api/quotes/request/:requestId
// @access  Private
exports.getQuotesForRequest = async (req, res, next) => {
  try {
    const quotes = await Quote.find({ request: req.params.requestId })
      .populate({
        path: "provider",
        select: "name email phone avatar",
      })
      .sort("estimatedPrice");

    // Augment with provider profile data (ratings, reviews, experience)
    const augmentedQuotes = await Promise.all(
      quotes.map(async (q) => {
        const profile = await ProviderProfile.findOne({ user: q.provider._id }).populate("skills");
        return {
          ...q.toObject(),
          providerProfile: profile,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: augmentedQuotes.length,
      data: augmentedQuotes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept quote & create booking
// @route   PUT /api/quotes/:id/accept
// @access  Private (Customer)
exports.acceptQuote = async (req, res, next) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found" });
    }

    const serviceRequest = await ServiceRequest.findById(quote.request).populate("category");
    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: "Associated request not found" });
    }

    if (String(serviceRequest.customer) !== String(req.user.id) && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "You are not authorized to accept this quote" });
    }

    quote.status = "ACCEPTED";
    await quote.save();

    // Reject other quotes for this request
    await Quote.updateMany({ request: quote.request, _id: { $ne: quote._id } }, { status: "REJECTED" });

    // Update request
    serviceRequest.status = "PROVIDER_SELECTED";
    serviceRequest.selectedProvider = quote.provider;
    serviceRequest.selectedQuote = quote._id;
    await serviceRequest.save();

    // Create Booking
    const bookingNumber = "ATD-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);
    const booking = await Booking.create({
      bookingNumber,
      customer: serviceRequest.customer,
      provider: quote.provider,
      request: serviceRequest._id,
      quote: quote._id,
      category: serviceRequest.category?._id,
      serviceName: serviceRequest.title || serviceRequest.category?.name || "Home Service",
      scheduledDate: quote.availableDate,
      scheduledTime: quote.availableTime,
      address: serviceRequest.address,
      price: quote.estimatedPrice,
      status: "CONFIRMED",
      eta: "On schedule",
    });

    // Create corresponding Job record
    await Job.create({
      booking: booking._id,
      provider: quote.provider,
      customer: serviceRequest.customer,
      status: "ASSIGNED",
    });

    // Create Invoice record
    const invoiceNumber = "INV-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);
    await Invoice.create({
      invoiceNumber,
      booking: booking._id,
      customer: serviceRequest.customer,
      provider: quote.provider,
      serviceName: booking.serviceName,
      basePrice: quote.estimatedPrice,
      visitCharge: quote.visitCharge || 0,
      finalAmount: quote.estimatedPrice + (quote.visitCharge || 0),
      paymentStatus: "ISSUED",
    });

    // Notifications
    await Notification.create({
      user: quote.provider,
      title: "Quote Accepted!",
      message: `Your quote for "${booking.serviceName}" has been accepted. Booking ${booking.bookingNumber} created.`,
      type: "BOOKING",
      referenceId: booking._id,
    });

    await Notification.create({
      user: serviceRequest.customer,
      title: "Booking Confirmed",
      message: `Your booking ${booking.bookingNumber} is confirmed for ${booking.scheduledDate} at ${booking.scheduledTime}.`,
      type: "BOOKING",
      referenceId: booking._id,
    });

    res.status(200).json({
      success: true,
      data: {
        quote,
        booking,
      },
      message: "Quote accepted and booking created successfully.",
    });
  } catch (err) {
    next(err);
  }
};
