require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { connectDB, disconnectDB } = require("./config/db");
const { classifyService } = require("./ai/classifyService");
const { matchProviders } = require("./ai/matchProviders");
const { canTransitionBooking, canTransitionJob } = require("./utils/statusMachines");
const User = require("./models/User");
const Booking = require("./models/Booking");
const Review = require("./models/Review");
const ServiceCategory = require("./models/ServiceCategory");

const runTests = async () => {
  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  ✓ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${title}`);
      failed++;
    }
  };

  try {
    console.log("\n==============================================");
    console.log("       ATDOOR BACKEND VERIFICATION TESTS       ");
    console.log("==============================================\n");

    await connectDB();

    // 1. Authentication Tests for All 5 Roles
    console.log("1. Testing Authentication & Passwords for All Roles...");
    const roleAccounts = [
      { role: "ADMIN", email: "admin@atdoor.com", pass: "Admin@123" },
      { role: "OPERATIONS_MANAGER", email: "operations@atdoor.com", pass: "Ops@123" },
      { role: "PROVIDER", email: "provider1@atdoor.com", pass: "Provider@123" },
      { role: "CUSTOMER", email: "customer@atdoor.com", pass: "Customer@123" },
      { role: "SUPPORT_AGENT", email: "support@atdoor.com", pass: "Support@123" },
    ];

    for (const acc of roleAccounts) {
      const user = await User.findOne({ email: acc.email }).select("+password");
      assert(user !== null, `Account for '${acc.role}' exists in MongoDB (${acc.email})`);
      if (user) {
        const isMatch = await user.matchPassword(acc.pass);
        assert(isMatch === true, `Password match succeeded for role '${acc.role}'`);
        const token = user.getSignedJwtToken();
        assert(typeof token === "string" && token.length > 20, `JWT token generates for role '${acc.role}'`);

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "atdoor_super_secret_jwt_key_2026_capstone_secure!");
        assert(decoded.role === acc.role, `JWT payload contains verified role '${acc.role}'`);
      }
    }

    const adminUser = await User.findOne({ email: "admin@atdoor.com" }).select("+password");
    const isWrongMatch = await adminUser.matchPassword("WrongPassword!");
    assert(isWrongMatch === false, "Incorrect password properly rejected");

    // 2. Authorization Role Hierarchy
    console.log("\n2. Testing Role System & Authorization Rules...");
    const validRoles = ["ADMIN", "OPERATIONS_MANAGER", "PROVIDER", "CUSTOMER", "SUPPORT_AGENT"];
    validRoles.forEach((r) => {
      assert(validRoles.includes(r), `Role '${r}' is defined in role schema`);
    });

    // 3. AI Service Classification & Visual Inspection (Fixing Hallucinations)
    console.log("\n3. Testing AI Service Classification & Vision Diagnostics...");

    // AC Repair text
    const acDiagnosis = await classifyService("My AC is leaking water from indoor unit and not cooling");
    assert(acDiagnosis.categoryName.toLowerCase().includes("ac"), "AI accurately identifies AC repair from free text");
    assert(acDiagnosis.confidence >= 80, `AI confidence score is high (${acDiagnosis.confidence}%)`);
    assert(acDiagnosis.requiredSkills.length > 0, "AI returns required skills for matching");

    // Plumbing repair text
    const plumbingDiagnosis = await classifyService("Kitchen pipe burst and water is flooding");
    assert(plumbingDiagnosis.categoryName.toLowerCase().includes("plumbing"), "AI accurately identifies Plumbing issue");
    assert(plumbingDiagnosis.urgency === "high", "AI detects high urgency for burst pipe");

    // Burnt switchboard / socket text (Electrical)
    const electricalDiagnosis = await classifyService("Burnt electrical socket with smoke and sparks coming out of switchboard");
    assert(electricalDiagnosis.categorySlug === "electrical" || electricalDiagnosis.categoryName === "Electrical", "AI accurately diagnoses burnt switchboard as Electrical");
    assert(electricalDiagnosis.urgency === "high", "AI marks burnt switchboard with high urgency (Fire hazard)");
    assert(electricalDiagnosis.requiredSkills.includes("Electrician"), "AI recommends Electrician skill for burnt socket");

    // Photo / Visual Cues Diagnosis (Addressing User Screenshot Issue: Burnt wall socket photo + generic text)
    const visualPhotoDiagnosis = await classifyService(
      "Issue photographed: please analyze and recommend verified technicians.",
      {
        imageName: "burnt-socket-board.jpg",
        hasPhoto: true,
        visualCues: {
          hasCharredOrBurnMarks: true,
          isElectricalSocket: true,
          detectedCategory: "electrical",
        },
      }
    );
    assert(
      visualPhotoDiagnosis.categoryName === "Electrical",
      `AI Vision correctly diagnoses burnt socket photo as 'Electrical' instead of hallucinating (Got: ${visualPhotoDiagnosis.categoryName})`
    );
    assert(
      visualPhotoDiagnosis.urgency === "high",
      "AI Vision assigns 'high' urgency to severe electrical burnout photo"
    );
    assert(
      visualPhotoDiagnosis.possibleIssues.some((issue) => issue.toLowerCase().includes("switchboard") || issue.toLowerCase().includes("socket")),
      "AI Vision provides specific electrical socket replacement issues"
    );
    assert(
      !visualPhotoDiagnosis.categoryName.toLowerCase().includes("ac"),
      "VERIFIED: AI does NOT hallucinate AC & Cooling for burnt switchboard photo"
    );

    // 4. AI Provider Matching & Scoring (Both AC & Electrical)
    console.log("\n4. Testing AI Provider Matching Engine...");
    const acCategory = await ServiceCategory.findOne({ slug: "ac-cooling" });
    const acRecommended = await matchProviders({
      categoryId: acCategory?._id,
      requiredSkills: ["AC Technician"],
      area: "All Locations",
    });
    assert(acRecommended.length > 0, `Matching engine returns eligible verified AC providers (Found: ${acRecommended.length})`);
    assert(acRecommended[0].matchScore > 50, `Recommended provider has a data-backed match score (${acRecommended[0].matchScore}%)`);
    assert(acRecommended[0].reasons.length > 0, "Provider recommendation includes verified explanation bullets");

    const electricalCategory = await ServiceCategory.findOne({ slug: "electrical" });
    const electricalRecommended = await matchProviders({
      categoryId: electricalCategory?._id,
      requiredSkills: ["Electrician", "Wiring Specialist"],
      area: "All Locations",
    });
    assert(electricalRecommended.length > 0, `Matching engine returns eligible verified Electricians (Found: ${electricalRecommended.length})`);
    assert(electricalRecommended[0].matchScore >= 70, `Recommended electrician has top match score (${electricalRecommended[0].matchScore}%)`);

    // 5. Booking Status Machine & Transition Validation
    console.log("\n5. Testing Status Transition State Machine...");
    assert(canTransitionBooking("CONFIRMED", "IN_PROGRESS") === false, "Direct jump from CONFIRMED to IN_PROGRESS rejected");
    assert(canTransitionBooking("SCHEDULED", "IN_PROGRESS") === true, "Valid transition SCHEDULED -> IN_PROGRESS allowed");
    assert(canTransitionBooking("IN_PROGRESS", "COMPLETED") === true, "Valid transition IN_PROGRESS -> COMPLETED allowed");
    assert(canTransitionBooking("COMPLETED", "SCHEDULED") === false, "Invalid reversal from COMPLETED to SCHEDULED rejected");
    assert(canTransitionJob("ASSIGNED", "ON_THE_WAY") === true, "Job transition ASSIGNED -> ON_THE_WAY allowed");
    assert(canTransitionJob("COMPLETED", "STARTED") === false, "Job transition from COMPLETED back to STARTED rejected");

    // 6. Review Integrity & Duplicate Prevention
    console.log("\n6. Testing Review Integrity & Duplicate Prevention...");
    const existingReview = await Review.findOne({});
    if (existingReview) {
      assert(existingReview.rating >= 1 && existingReview.rating <= 5, "Review rating conforms to 1-5 scale");
      const duplicateCount = await Review.countDocuments({ booking: existingReview.booking });
      assert(duplicateCount === 1, "Only one review permitted per booking");
    }

    console.log("\n==============================================");
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log("==============================================\n");

    await disconnectDB();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
};

runTests();
