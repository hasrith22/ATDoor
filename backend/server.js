const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const { connectDB } = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const providerRoutes = require("./routes/providerRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const skillRoutes = require("./routes/skillRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const requestRoutes = require("./routes/requestRoutes");
const quoteRoutes = require("./routes/quoteRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const jobRoutes = require("./routes/jobRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const disputeRoutes = require("./routes/disputeRoutes");
const pricingRoutes = require("./routes/pricingRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// Database connection
connectDB();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Serve static uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    app: "AtDoor API",
    version: "1.0.0",
    time: new Date().toISOString(),
  });
});

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/notifications", notificationRoutes);

// Catch 404 for unknown API endpoints
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`,
    code: "ENDPOINT_NOT_FOUND",
  });
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  const server = app.listen(PORT, () => {
    console.log(`[AtDoor Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n[AtDoor Server Error] Port ${PORT} is already in use by another process.`);
      console.error(`Please stop the previous server instance or kill the process on port ${PORT}.\n`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}

module.exports = app;
