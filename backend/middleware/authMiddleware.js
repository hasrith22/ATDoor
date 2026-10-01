const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - JWT verification
const authenticate = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route. Please log in.",
      code: "NOT_AUTHENTICATED",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "atdoor_jwt_secret_default_key");
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account associated with this token no longer exists.",
        code: "USER_NOT_FOUND",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
        code: "ACCOUNT_INACTIVE",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authorization token.",
      code: "INVALID_TOKEN",
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role || "GUEST"}' is not authorized to access this resource.`,
        code: "FORBIDDEN_ROLE",
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
