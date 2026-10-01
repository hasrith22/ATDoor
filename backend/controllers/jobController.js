const Job = require("../models/Job");
const Booking = require("../models/Booking");
const ProviderProfile = require("../models/ProviderProfile");
const Notification = require("../models/Notification");
const { canTransitionJob } = require("../utils/statusMachines");

// @desc    Get jobs for provider
// @route   GET /api/jobs/my
// @access  Private (Provider)
exports.getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ provider: req.user.id })
      .populate({
        path: "booking",
        populate: { path: "customer", select: "name phone email avatar" },
      })
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job by ID or booking ID
// @route   GET /api/jobs/:id
// @access  Private
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findOne({
      $or: [{ _id: req.params.id }, { booking: req.params.id }],
    })
      .populate({
        path: "booking",
        populate: [
          { path: "customer", select: "name phone email avatar" },
          { path: "provider", select: "name phone email avatar" },
          { path: "category" },
        ],
      })
      .populate("provider", "name phone avatar")
      .populate("customer", "name phone avatar");

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update job status (validated state machine)
// @route   PUT /api/jobs/:id/status
// @access  Private (Provider)
exports.updateJobStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const job = await Job.findById(req.params.id).populate("booking");

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (!canTransitionJob(job.status, status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid job status transition from ${job.status} to ${status}`,
        code: "INVALID_JOB_TRANSITION",
      });
    }

    job.status = status;
    if (notes) job.jobNotes = notes;

    if (status === "STARTED") {
      job.startedAt = new Date();
      if (job.booking) {
        job.booking.status = "IN_PROGRESS";
        await job.booking.save();
      }
    } else if (status === "COMPLETED") {
      job.completedAt = new Date();
      if (job.booking) {
        job.booking.status = "COMPLETED";
        await job.booking.save();
      }

      // Update provider completed jobs count
      await ProviderProfile.findOneAndUpdate(
        { user: job.provider },
        { $inc: { completedJobs: 1 } }
      );
    }

    await job.save();

    // Notify customer
    await Notification.create({
      user: job.customer,
      title: `Job Status: ${status.replace(/_/g, " ")}`,
      message: `Your professional updated the job status to ${status.replace(/_/g, " ")}.`,
      type: "JOB",
      referenceId: job._id,
    });

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload service evidence (before/after photos)
// @route   POST /api/jobs/:id/evidence
// @access  Private (Provider)
exports.uploadEvidence = async (req, res, next) => {
  try {
    const { type, photoUrl } = req.body; // type: "before" | "after"
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (type === "before") {
      job.beforePhotos.push(photoUrl);
    } else {
      job.afterPhotos.push(photoUrl);
    }

    await job.save();

    res.status(200).json({
      success: true,
      data: job,
      message: `${type === "before" ? "Before" : "After"} photo uploaded successfully`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Customer confirms job completion
// @route   POST /api/jobs/:id/confirm
// @access  Private (Customer)
exports.confirmCompletion = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    job.customerConfirmation = {
      confirmed: true,
      confirmedAt: new Date(),
      notes: notes || "Customer confirmed service completed satisfactorily.",
    };

    await job.save();

    res.status(200).json({
      success: true,
      data: job,
      message: "Service completion confirmed. Thank you!",
    });
  } catch (err) {
    next(err);
  }
};
