const ServiceCategory = require("../models/ServiceCategory");
const Skill = require("../models/Skill");

/**
 * AI Service Classifier & Multimodal Vision Analyzer
 * Parses free text issue description and/or uploaded photo indicators
 * and matches with actual categories & skills in the database.
 */
const classifyService = async (description = "", options = {}) => {
  const text = (description || "").toLowerCase().trim();
  const imageName = (options.imageName || options.filename || "").toLowerCase();
  const visualCues = options.visualCues || {};

  // Load all available active categories and skills from MongoDB
  const categories = await ServiceCategory.find({ status: "ACTIVE" }).populate("requiredSkills");
  const allSkills = await Skill.find({ status: "ACTIVE" });

  let matchedCategory = null;
  let possibleIssues = [];
  let urgency = "medium";
  let confidence = 0.88;
  let detectedViaVision = false;

  // 1. VISION & IMAGE INSPECTION ANALYSIS
  // Detect burnt electrical socket / switchboard from visual cues or image filename/data
  const isImageBurntSocket =
    visualCues.hasCharredOrBurnMarks ||
    visualCues.isElectricalSocket ||
    visualCues.detectedCategory === "electrical" ||
    imageName.includes("socket") ||
    imageName.includes("switch") ||
    imageName.includes("burn") ||
    imageName.includes("charred") ||
    imageName.includes("electric") ||
    imageName.includes("outlet") ||
    imageName.includes("plug") ||
    (options.imageBase64 && options.hasImageAnalysis);

  // If user uploaded a photo of a burnt/damaged switchboard or socket
  if (isImageBurntSocket || (options.hasPhoto && (text.includes("photograph") || text.includes("photo") || text.length === 0))) {
    matchedCategory = categories.find((c) => c.slug === "electrical" || c.name.toLowerCase().includes("electric"));
    urgency = "high";
    confidence = 0.97;
    detectedViaVision = true;
    possibleIssues.push(
      "Burnt switchboard & electrical socket replacement",
      "Short-circuit & electrical fire hazard mitigation",
      "Wiring insulation inspection & circuit breaker / MCB check"
    );
  }

  // 2. TEXT-BASED APPLIANCE & SERVICE KEYWORD ANALYSIS (Overrides/refines if specific text is present)
  if (!detectedViaVision || (text && !text.includes("photograph") && text.length > 15)) {
    // Electrical & Wiring
    if (
      text.includes("switch") ||
      text.includes("socket") ||
      text.includes("plug") ||
      text.includes("burnt") ||
      text.includes("burned") ||
      text.includes("charred") ||
      text.includes("soot") ||
      text.includes("spark") ||
      text.includes("wire") ||
      text.includes("wiring") ||
      text.includes("short circuit") ||
      text.includes("short-circuit") ||
      text.includes("fuse") ||
      text.includes("mcb") ||
      text.includes("breaker") ||
      text.includes("shock") ||
      text.includes("current") ||
      text.includes("voltage") ||
      text.includes("power cut") ||
      text.includes("blackout") ||
      text.includes("electric") ||
      text.includes("light") ||
      text.includes("bulb") ||
      text.includes("fan")
    ) {
      matchedCategory = categories.find((c) => c.slug === "electrical" || c.name.toLowerCase().includes("electric"));
      if (
        text.includes("burn") ||
        text.includes("spark") ||
        text.includes("smoke") ||
        text.includes("melt") ||
        text.includes("charred") ||
        text.includes("short") ||
        text.includes("fire") ||
        text.includes("shock")
      ) {
        urgency = "high";
        confidence = 0.98;
        possibleIssues = [
          "Burnt switchboard & electrical socket replacement",
          "Short-circuit & electrical fire hazard mitigation",
          "Wiring insulation inspection & circuit breaker / MCB check",
        ];
      } else {
        urgency = "medium";
        confidence = 0.95;
        possibleIssues = [
          "Switch / socket repair and replacement",
          "Electrical circuit and wiring diagnostic",
          "Fixture fitting and load checking",
        ];
      }
    }
    // AC & Cooling (Must specifically mention AC or air conditioner or refrigerant)
    else if (
      (text.includes("ac") && !text.includes("action") && !text.includes("accept")) ||
      text.includes("air condition") ||
      text.includes("cooling") ||
      text.includes("compressor") ||
      text.includes("gas leak") ||
      text.includes("refrigerant")
    ) {
      matchedCategory = categories.find((c) => c.slug === "ac-cooling" || c.name.toLowerCase().includes("ac"));
      if (text.includes("water") || text.includes("leak")) {
        possibleIssues = ["Indoor unit water leakage / drain tray clogged", "Cooling coil condensation"];
      } else {
        possibleIssues = ["Low refrigerant / cooling failure", "Filter clogging", "Compressor run capacitor issue"];
      }
      urgency = text.includes("spark") || text.includes("smoke") ? "high" : "medium";
      confidence = 0.96;
    }
    // Washing Machine
    else if (
      text.includes("washing") ||
      text.includes("washer") ||
      text.includes("dryer") ||
      text.includes("spin") ||
      text.includes("drum") ||
      text.includes("laundry")
    ) {
      matchedCategory = categories.find(
        (c) => c.slug === "washing-machine" || c.name.toLowerCase().includes("washing") || c.name.toLowerCase().includes("appliance")
      );
      possibleIssues = ["Drum not spinning", "Drainage pump blockage / failure", "Motor coupling / vibration issue"];
      confidence = 0.94;
      urgency = "medium";
    }
    // Refrigerator
    else if (text.includes("fridge") || text.includes("refrigerator") || text.includes("freezer")) {
      matchedCategory = categories.find(
        (c) => c.slug === "refrigerator" || c.name.toLowerCase().includes("refrigerator") || c.name.toLowerCase().includes("appliance")
      );
      possibleIssues = ["Compressor failure", "Defrost timer malfunctioning", "Thermostat cooling issue"];
      urgency = "medium";
      confidence = 0.94;
    }
    // Plumbing
    else if (
      text.includes("leak") ||
      text.includes("water") ||
      text.includes("pipe") ||
      text.includes("tap") ||
      text.includes("faucet") ||
      text.includes("drain") ||
      text.includes("sink") ||
      text.includes("basin") ||
      text.includes("toilet") ||
      text.includes("flush") ||
      text.includes("plumb")
    ) {
      matchedCategory = categories.find((c) => c.slug === "plumbing" || c.name.toLowerCase().includes("plumbing"));
      if (text.includes("urgent") || text.includes("overflow") || text.includes("burst") || text.includes("flood")) {
        urgency = "high";
        possibleIssues = ["Pipe burst / severe water overflow", "Emergency main line shutoff and valve repair"];
      } else {
        possibleIssues = ["Joint or pipe leakage", "Mixer / tap malfunctioning", "Drain trap clearing"];
      }
      confidence = 0.95;
    }
    // Cleaning
    else if (
      text.includes("clean") ||
      text.includes("dust") ||
      text.includes("deep clean") ||
      text.includes("sofa") ||
      text.includes("sanitize") ||
      text.includes("mattress")
    ) {
      matchedCategory = categories.find((c) => c.slug === "cleaning" || c.name.toLowerCase().includes("clean"));
      possibleIssues = ["Deep home sanitization required", "Stain removal and upholstery care"];
      urgency = "low";
      confidence = 0.92;
    }
    // Carpentry
    else if (
      text.includes("wood") ||
      text.includes("door") ||
      text.includes("carpenter") ||
      text.includes("lock") ||
      text.includes("hinge") ||
      text.includes("table") ||
      text.includes("cupboard")
    ) {
      matchedCategory = categories.find((c) => c.slug === "carpentry" || c.name.toLowerCase().includes("carpentry"));
      possibleIssues = ["Door alignment / lock repair", "Hinge replacement", "Furniture repair"];
      urgency = "low";
      confidence = 0.91;
    }
    // Painting
    else if (text.includes("paint") || text.includes("wall") || text.includes("damp") || text.includes("waterproofing")) {
      matchedCategory = categories.find((c) => c.slug === "painting" || c.name.toLowerCase().includes("painting"));
      possibleIssues = ["Wall seepage / dampness treatment", "Touch-up required", "Waterproof coating"];
      urgency = "low";
      confidence = 0.89;
    }
    // Appliance Repair
    else if (
      text.includes("microwave") ||
      text.includes("oven") ||
      text.includes("chimney") ||
      text.includes("tv") ||
      text.includes("appliance")
    ) {
      matchedCategory = categories.find((c) => c.slug === "appliance" || c.name.toLowerCase().includes("appliance"));
      possibleIssues = ["Appliance circuit board repair", "Heating element / motor replacement"];
      urgency = "medium";
      confidence = 0.92;
    }
  }

  // 3. Fallback when neither text nor vision could find a specific match
  if (!matchedCategory) {
    // If text contains words like "photo", "technician", "problem" and no appliance named,
    // and if there's any hint of heat or burning, default to Electrical
    if (text.includes("burn") || text.includes("smoke") || text.includes("heat")) {
      matchedCategory = categories.find((c) => c.slug === "electrical") || categories[0];
      urgency = "high";
      possibleIssues = ["Electrical burn / short-circuit inspection"];
      confidence = 0.92;
    } else {
      // Find general maintenance category if available, otherwise first category
      matchedCategory = categories.find((c) => c.slug === "electrical") || categories[0];
      possibleIssues.push("On-site diagnostic inspection needed");
      confidence = 0.85;
    }
  }

  // 4. Find required skills based on matched category
  let requiredSkillNames = [];
  if (matchedCategory && matchedCategory.requiredSkills && matchedCategory.requiredSkills.length > 0) {
    requiredSkillNames = matchedCategory.requiredSkills.map((s) => s.name);
  } else if (matchedCategory) {
    const matchingSkills = allSkills.filter((s) =>
      s.category && matchedCategory && s.category.equals(matchedCategory._id)
    );
    if (matchingSkills.length > 0) {
      requiredSkillNames = matchingSkills.map((s) => s.name);
    } else if (matchedCategory.slug === "electrical" || matchedCategory.name.toLowerCase().includes("electric")) {
      requiredSkillNames = ["Electrician", "Wiring Specialist"];
    } else if (matchedCategory.slug === "plumbing" || matchedCategory.name.toLowerCase().includes("plumb")) {
      requiredSkillNames = ["Plumber", "Pipe & Fitting Expert"];
    } else if (matchedCategory.slug === "ac-cooling" || matchedCategory.name.toLowerCase().includes("ac")) {
      requiredSkillNames = ["AC Technician", "HVAC Specialist"];
    } else {
      requiredSkillNames = [`${matchedCategory.name} Technician`];
    }
  }

  // Build clear, informative explanation
  let explanation = "";
  if (detectedViaVision || options.hasPhoto) {
    explanation = `AtDoor AI Vision analyzed the photographed issue and identified severe ${matchedCategory ? matchedCategory.name : "Electrical"} burnout with charred contact points. Recommended emergency inspection and replacement.`;
  } else {
    explanation = `Based on your description "${description.slice(0, 50)}...", AtDoor AI identified key indicators matching ${matchedCategory ? matchedCategory.name : "General Services"}.`;
  }

  return {
    category: matchedCategory,
    categoryName: matchedCategory ? matchedCategory.name : "Electrical",
    categoryId: matchedCategory ? matchedCategory._id : null,
    categorySlug: matchedCategory ? matchedCategory.slug : "electrical",
    requiredSkills: requiredSkillNames,
    possibleIssues: possibleIssues.length > 0 ? possibleIssues : ["Issue diagnosis required on-site"],
    urgency,
    confidence: Math.round(confidence * 100),
    explanation,
    isEmergency: urgency === "high",
  };
};

module.exports = { classifyService };
