const ServiceRequest = require("../models/ServiceRequest");
const ServiceCategory = require("../models/ServiceCategory");
const Notification = require("../models/Notification");
const { classifyService } = require("../ai/classifyService");

// @desc    Preview AI classification from free text and/or uploaded photo
// @route   POST /api/requests/ai-classify
// @access  Public
exports.classifyText = async (req, res, next) => {
  try {
    const { text, image, imageBase64, imageName, visualCues, hasPhoto } = req.body;

    if ((!text || text.trim().length === 0) && !imageBase64 && !image && !hasPhoto) {
      return res.status(400).json({
        success: false,
        message: "Please provide a problem description or upload a photo to classify",
      });
    }

    const aiResult = await classifyService(text || "", {
      image,
      imageBase64,
      imageName,
      visualCues,
      hasPhoto: Boolean(hasPhoto || imageBase64 || image),
    });

    res.status(200).json({
      success: true,
      data: aiResult,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new service request
// @route   POST /api/requests
// @access  Private (Customer)
exports.createRequest = async (req, res, next) => {
  try {
    const {
      categoryId,
      title,
      description,
      address,
      preferredDate,
      preferredTime,
      urgency,
      budget,
      attachments,
    } = req.body;

    // AI Classification run
    const aiResult = await classifyService(description);

    const matchedCategoryId = categoryId || aiResult.categoryId;

    const request = await ServiceRequest.create({
      customer: req.user.id,
      category: matchedCategoryId,
      title: title || `${aiResult.categoryName} Service`,
      description,
      address: address || {
        addressLine: "123 Indiranagar 100ft Road",
        area: "Indiranagar",
        city: "Bengaluru",
      },
      preferredDate: preferredDate || new Date().toISOString().split("T")[0],
      preferredTime: preferredTime || "10:00 AM",
      urgency: urgency || aiResult.urgency,
      budget: budget || 500,
      attachments: attachments || [],
      aiClassification: {
        categoryName: aiResult.categoryName,
        requiredSkills: aiResult.requiredSkills,
        possibleIssues: aiResult.possibleIssues,
        urgency: aiResult.urgency,
        confidence: aiResult.confidence,
        analyzedAt: new Date(),
      },
      status: "AI_CLASSIFIED",
    });

    // Create notification for customer
    await Notification.create({
      user: req.user.id,
      title: "Request Analyzed by AtDoor AI",
      message: `Your issue was identified as ${aiResult.categoryName} (${aiResult.confidence}% confidence). We are matching verified professionals.`,
      type: "REQUEST",
      referenceId: request._id,
    });

    res.status(201).json({
      success: true,
      data: request,
      aiClassification: aiResult,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current customer's requests
// @route   GET /api/requests/my
// @access  Private (Customer)
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await ServiceRequest.find({ customer: req.user.id })
      .populate("category")
      .populate("selectedProvider", "name phone avatar")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single request by ID
// @route   GET /api/requests/:id
// @access  Private
exports.getRequestById = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate("customer", "name phone email avatar")
      .populate("category")
      .populate("selectedProvider", "name phone avatar");

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get open requests available for providers to quote on
// @route   GET /api/requests/open
// @access  Private (Provider, Operations, Admin)
exports.getOpenRequests = async (req, res, next) => {
  try {
    const requests = await ServiceRequest.find({
      status: { $in: ["AI_CLASSIFIED", "PROVIDER_SEARCH", "QUOTES_RECEIVED"] },
    })
      .populate("customer", "name avatar")
      .populate("category")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};
