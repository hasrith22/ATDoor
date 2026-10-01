// Valid booking status transitions
const VALID_BOOKING_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROVIDER_ASSIGNED", "SCHEDULED", "CANCELLED"],
  PROVIDER_ASSIGNED: ["SCHEDULED", "IN_PROGRESS", "CANCELLED"],
  SCHEDULED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "DISPUTED", "CANCELLED"],
  COMPLETED: ["DISPUTED"],
  CANCELLED: [],
  DISPUTED: ["COMPLETED", "CANCELLED"],
};

const canTransitionBooking = (currentStatus, targetStatus) => {
  const allowed = VALID_BOOKING_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
};

// Valid job status transitions
const VALID_JOB_TRANSITIONS = {
  ASSIGNED: ["ON_THE_WAY", "STARTED", "CANCELLED"],
  ON_THE_WAY: ["STARTED", "CANCELLED"],
  STARTED: ["PAUSED", "COMPLETED", "CANCELLED"],
  PAUSED: ["STARTED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

const canTransitionJob = (currentStatus, targetStatus) => {
  const allowed = VALID_JOB_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
};

// Valid provider verification transitions
const VALID_VERIFICATION_TRANSITIONS = {
  PENDING: ["UNDER_REVIEW", "VERIFIED", "REJECTED"],
  UNDER_REVIEW: ["VERIFIED", "REJECTED"],
  VERIFIED: ["SUSPENDED"],
  REJECTED: ["UNDER_REVIEW"],
  SUSPENDED: ["VERIFIED"],
};

const canTransitionVerification = (currentStatus, targetStatus) => {
  const allowed = VALID_VERIFICATION_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
};

module.exports = {
  VALID_BOOKING_TRANSITIONS,
  canTransitionBooking,
  VALID_JOB_TRANSITIONS,
  canTransitionJob,
  VALID_VERIFICATION_TRANSITIONS,
  canTransitionVerification,
};
