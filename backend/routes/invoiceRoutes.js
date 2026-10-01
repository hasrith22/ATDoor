const express = require("express");
const router = express.Router();
const { getInvoices, getInvoiceById, payInvoice } = require("../controllers/invoiceController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/", authenticate, getInvoices);
router.get("/:id", authenticate, getInvoiceById);
router.post("/:id/pay", authenticate, payInvoice);

module.exports = router;
