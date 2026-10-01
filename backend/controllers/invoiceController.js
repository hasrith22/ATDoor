const Invoice = require("../models/Invoice");
const ProviderProfile = require("../models/ProviderProfile");
const Notification = require("../models/Notification");

// @desc    Get customer or provider invoices
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "CUSTOMER") {
      query.customer = req.user.id;
    } else if (req.user.role === "PROVIDER") {
      query.provider = req.user.id;
    }

    const invoices = await Invoice.find(query)
      .populate("customer", "name email phone")
      .populate("provider", "name email phone")
      .populate("booking")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customer", "name email phone avatar")
      .populate("provider", "name email phone avatar")
      .populate("booking");

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mock pay invoice
// @route   POST /api/invoices/:id/pay
// @access  Private (Customer)
exports.payInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    invoice.paymentStatus = "PAID";
    invoice.paidAt = new Date();
    await invoice.save();

    // Credit provider earnings
    const providerEarnings = Math.round(invoice.finalAmount * 0.85); // 85% to provider
    await ProviderProfile.findOneAndUpdate(
      { user: invoice.provider },
      { $inc: { "earnings.total": providerEarnings } }
    );

    // Notify provider
    await Notification.create({
      user: invoice.provider,
      title: "Payment Received",
      message: `Payment of ₹${invoice.finalAmount} received for Invoice ${invoice.invoiceNumber}. Your payout of ₹${providerEarnings} is recorded.`,
      type: "PAYMENT",
      referenceId: invoice._id,
    });

    res.status(200).json({
      success: true,
      data: invoice,
      message: "Payment processed successfully (Mock Sandbox Payment).",
    });
  } catch (err) {
    next(err);
  }
};
