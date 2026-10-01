require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB, disconnectDB } = require("./config/db");

// Models
const User = require("./models/User");
const CustomerProfile = require("./models/CustomerProfile");
const ProviderProfile = require("./models/ProviderProfile");
const ServiceCategory = require("./models/ServiceCategory");
const Skill = require("./models/Skill");
const Availability = require("./models/Availability");
const ServiceRequest = require("./models/ServiceRequest");
const Quote = require("./models/Quote");
const Booking = require("./models/Booking");
const Job = require("./models/Job");
const Invoice = require("./models/Invoice");
const Review = require("./models/Review");
const Dispute = require("./models/Dispute");
const Notification = require("./models/Notification");
const AuditLog = require("./models/AuditLog");
const PricingRule = require("./models/PricingRule");

const seedData = async () => {
  try {
    console.log("[Seeder] Connecting to database...");
    await connectDB();

    console.log("[Seeder] Clearing old records...");
    await Promise.all([
      User.deleteMany({}),
      CustomerProfile.deleteMany({}),
      ProviderProfile.deleteMany({}),
      ServiceCategory.deleteMany({}),
      Skill.deleteMany({}),
      Availability.deleteMany({}),
      ServiceRequest.deleteMany({}),
      Quote.deleteMany({}),
      Booking.deleteMany({}),
      Job.deleteMany({}),
      Invoice.deleteMany({}),
      Review.deleteMany({}),
      Dispute.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      PricingRule.deleteMany({}),
    ]);

    console.log("[Seeder] Creating Service Categories...");
    const categoriesData = [
      {
        name: "AC & Cooling",
        slug: "ac-cooling",
        description: "Service, repair, gas charging and installation",
        icon: "AirVent",
        basePrice: 599,
        options: ["AC inspection", "AC service", "Cooling repair", "Installation"],
      },
      {
        name: "Plumbing",
        slug: "plumbing",
        description: "Leaks, fittings, pipe bursts and installations",
        icon: "Droplets",
        basePrice: 449,
        options: ["Leakage & Connections", "Tap & Mixer Repair", "Drain cleaning", "Bathroom fittings"],
      },
      {
        name: "Electrical",
        slug: "electrical",
        description: "Wiring, switches, MCBs and lighting fixtures",
        icon: "CircuitBoard",
        basePrice: 349,
        options: ["Switch repair", "Fan installation", "Wiring check", "Power issue"],
      },
      {
        name: "Appliance Repair",
        slug: "appliance",
        description: "Microwave, TV, chimney and kitchen appliance fixes",
        icon: "Wrench",
        basePrice: 399,
        options: ["Microwave repair", "Chimney service", "TV repair", "Small appliances"],
      },
      {
        name: "Home Cleaning",
        slug: "cleaning",
        description: "Deep sanitization and full home cleaning",
        icon: "Sparkles",
        basePrice: 699,
        options: ["Full home cleaning", "Bathroom cleaning", "Kitchen cleaning", "Sofa cleaning"],
      },
      {
        name: "Carpentry",
        slug: "carpentry",
        description: "Furniture repair, locks, hinges and custom fittings",
        icon: "Hammer",
        basePrice: 399,
        options: ["Furniture repair", "Door repair", "Shelf installation", "Custom fitting"],
      },
      {
        name: "Painting",
        slug: "painting",
        description: "Interior touch-ups, wall waterproofing and painting",
        icon: "Brush",
        basePrice: 1499,
        options: ["Wall painting", "Touch-up", "Waterproofing", "Texture painting"],
      },
      {
        name: "Washing Machine",
        slug: "washing-machine",
        description: "Motor, drum, drainage and spin repairs",
        icon: "WashingMachine",
        basePrice: 499,
        options: ["Not spinning", "Water leakage", "Installation", "General service"],
      },
      {
        name: "Refrigerator",
        slug: "refrigerator",
        description: "Compressor, cooling and gas leak repairs",
        icon: "Refrigerator",
        basePrice: 499,
        options: ["Not cooling", "Water leakage", "Noise issue", "General service"],
      },
    ];

    const categories = await ServiceCategory.insertMany(categoriesData);
    const catMap = {};
    categories.forEach((c) => {
      catMap[c.slug] = c._id;
    });

    console.log("[Seeder] Creating Skills...");
    const skillsData = [
      { name: "AC Technician", category: catMap["ac-cooling"] },
      { name: "HVAC Specialist", category: catMap["ac-cooling"] },
      { name: "Plumber", category: catMap["plumbing"] },
      { name: "Pipe & Fitting Expert", category: catMap["plumbing"] },
      { name: "Electrician", category: catMap["electrical"] },
      { name: "Wiring Specialist", category: catMap["electrical"] },
      { name: "Appliance Technician", category: catMap["appliance"] },
      { name: "Deep Cleaning Specialist", category: catMap["cleaning"] },
      { name: "Carpenter", category: catMap["carpentry"] },
      { name: "Painter", category: catMap["painting"] },
      { name: "Washing Machine Technician", category: catMap["washing-machine"] },
      { name: "Refrigerator Specialist", category: catMap["refrigerator"] },
    ];
    const skills = await Skill.insertMany(skillsData);
    const skillMap = {};
    skills.forEach((s) => {
      skillMap[s.name] = s._id;
    });

    console.log("[Seeder] Creating Users & Profiles...");
    // 1. Admin
    const admin = await User.create({
      name: "AtDoor Admin",
      email: "admin@atdoor.com",
      phone: "+91 98765 00001",
      password: "Admin@123",
      role: "ADMIN",
    });

    // 2. Operations Manager
    const opsManager = await User.create({
      name: "Prakash Varma",
      email: "operations@atdoor.com",
      phone: "+91 98765 00002",
      password: "Ops@123",
      role: "OPERATIONS_MANAGER",
    });

    // 3. Support Agent
    const supportAgent = await User.create({
      name: "Sneha Nair",
      email: "support@atdoor.com",
      phone: "+91 98765 00003",
      password: "Support@123",
      role: "SUPPORT_AGENT",
    });

    // 4. Customers
    const customer1 = await User.create({
      name: "Hasrith Rao",
      email: "customer@atdoor.com",
      phone: "+91 98765 43210",
      password: "Customer@123",
      role: "CUSTOMER",
    });
    await CustomerProfile.create({
      user: customer1._id,
      addresses: [
        {
          label: "Home",
          addressLine: "Flat 402, Green Glen Layout",
          area: "Bellandur",
          city: "Bengaluru",
          pincode: "560103",
          isDefault: true,
        },
        {
          label: "Office",
          addressLine: "Embassy GolfLinks, Intermediate Ring Rd",
          area: "Indiranagar",
          city: "Bengaluru",
          pincode: "560071",
        },
      ],
      totalBookings: 3,
    });

    const customer2 = await User.create({
      name: "Ananya Verma",
      email: "customer2@atdoor.com",
      phone: "+91 98765 43211",
      password: "Customer@123",
      role: "CUSTOMER",
    });
    await CustomerProfile.create({
      user: customer2._id,
      addresses: [
        {
          label: "Home",
          addressLine: "Plot 88, 14th Main, HSR Sector 4",
          area: "HSR Layout",
          city: "Bengaluru",
          pincode: "560102",
          isDefault: true,
        },
      ],
      totalBookings: 1,
    });

    // 5. Providers
    // Provider 1: Ravi Kumar (Plumber)
    const providerUser1 = await User.create({
      name: "Ravi Kumar",
      email: "provider1@atdoor.com",
      phone: "+91 98765 11111",
      password: "Provider@123",
      role: "PROVIDER",
    });
    const provProfile1 = await ProviderProfile.create({
      user: providerUser1._id,
      businessName: "Ravi Plumbing Works",
      title: "Plumbing Specialist",
      verificationStatus: "VERIFIED",
      skills: [skillMap["Plumber"], skillMap["Pipe & Fitting Expert"]],
      categories: [catMap["plumbing"]],
      serviceAreas: ["Indiranagar", "Koramangala", "HSR Layout", "Bellandur", "All Locations"],
      experienceYears: 6,
      description: "Certified master plumber with over 6 years solving bathroom, kitchen and water pump leakages.",
      basePrice: 499,
      minServiceCharge: 199,
      rating: 4.8,
      totalReviews: 1284,
      completedJobs: 1350,
      responseTime: "Responds in 5 min",
      earnings: { total: 48500, pending: 2400, withdrawn: 46100 },
    });

    // Provider 2: Suresh Reddy (AC Tech)
    const providerUser2 = await User.create({
      name: "Suresh Reddy",
      email: "provider2@atdoor.com",
      phone: "+91 98765 22222",
      password: "Provider@123",
      role: "PROVIDER",
    });
    const provProfile2 = await ProviderProfile.create({
      user: providerUser2._id,
      businessName: "Reddy AC Solutions",
      title: "Home Cooling Expert",
      verificationStatus: "VERIFIED",
      skills: [skillMap["AC Technician"], skillMap["HVAC Specialist"]],
      categories: [catMap["ac-cooling"]],
      serviceAreas: ["Whitefield", "Marathahalli", "Bellandur", "All Locations"],
      experienceYears: 5,
      description: "Specialized in inverter AC servicing, coil cleaning, gas recharge, and compressor maintenance.",
      basePrice: 599,
      minServiceCharge: 249,
      rating: 4.7,
      totalReviews: 923,
      completedJobs: 980,
      responseTime: "Responds in 8 min",
      earnings: { total: 39200, pending: 1800, withdrawn: 37400 },
    });

    // Provider 3: Arjun Services (Electrical)
    const providerUser3 = await User.create({
      name: "Arjun Services",
      email: "provider3@atdoor.com",
      phone: "+91 98765 33333",
      password: "Provider@123",
      role: "PROVIDER",
    });
    const provProfile3 = await ProviderProfile.create({
      user: providerUser3._id,
      businessName: "Arjun Electrical & Maintenance",
      title: "Senior Licensed Electrician",
      verificationStatus: "VERIFIED",
      skills: [skillMap["Electrician"], skillMap["Wiring Specialist"], skillMap["Appliance Technician"]],
      categories: [catMap["electrical"], catMap["appliance"]],
      serviceAreas: ["Jayanagar", "JP Nagar", "BTM Layout", "All Locations"],
      experienceYears: 8,
      description: "Government licensed electrical contractor for rewiring, 3-phase circuits, and home appliances.",
      basePrice: 449,
      minServiceCharge: 199,
      rating: 4.9,
      totalReviews: 1542,
      completedJobs: 1720,
      responseTime: "Responds in 12 min",
      earnings: { total: 64200, pending: 3500, withdrawn: 60700 },
    });

    // Provider 4: Pooja Sharma (Pending Verification for Admin demo)
    const providerUser4 = await User.create({
      name: "Pooja Sharma",
      email: "provider4@atdoor.com",
      phone: "+91 98765 44444",
      password: "Provider@123",
      role: "PROVIDER",
    });
    await ProviderProfile.create({
      user: providerUser4._id,
      businessName: "Pooja Deep Cleaners",
      title: "Deep Cleaning & Sanitization Specialist",
      verificationStatus: "PENDING",
      skills: [skillMap["Deep Cleaning Specialist"]],
      categories: [catMap["cleaning"]],
      serviceAreas: ["Indiranagar", "Koramangala"],
      experienceYears: 4,
      description: "Specialized in eco-friendly steam sanitization and deep kitchen scrub.",
      basePrice: 699,
      documents: [
        { type: "ID_PROOF", name: "Aadhaar Card", url: "/uploads/sample-id.pdf" },
        { type: "CERTIFICATE", name: "Hygiene Certification", url: "/uploads/sample-cert.pdf" },
      ],
    });

    // Availability schedules
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    for (const provUser of [providerUser1, providerUser2, providerUser3]) {
      await Availability.create({
        provider: provUser._id,
        weeklySchedule: days.map((d) => ({
          day: d,
          isActive: true,
          slots: [
            { start: "09:00", end: "13:00", isBooked: false },
            { start: "14:00", end: "18:00", isBooked: false },
          ],
        })),
      });
    }

    console.log("[Seeder] Creating Pricing Rules...");
    await PricingRule.create([
      {
        name: "Standard AC Service Policy",
        category: catMap["ac-cooling"],
        basePrice: 599,
        visitFee: 99,
        emergencySurcharge: 199,
        weekendMultiplier: 1.1,
      },
      {
        name: "Standard Plumbing Policy",
        category: catMap["plumbing"],
        basePrice: 449,
        visitFee: 99,
        emergencySurcharge: 150,
      },
      {
        name: "Global Platform Pricing Rule",
        isGlobal: true,
        basePrice: 399,
        visitFee: 99,
        emergencySurcharge: 150,
        weekendMultiplier: 1.1,
        peakHourMultiplier: 1.15,
      },
    ]);

    console.log("[Seeder] Creating Bookings & Jobs...");
    // Booking 1: In Progress
    const booking1 = await Booking.create({
      bookingNumber: "ATD-2026-00124",
      customer: customer1._id,
      provider: providerUser1._id,
      category: catMap["plumbing"],
      serviceName: "Tap & Mixer Repair",
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: "10:00 AM",
      address: {
        addressLine: "Flat 402, Green Glen Layout",
        area: "Bellandur",
        city: "Bengaluru",
        pincode: "560103",
      },
      price: 499,
      status: "IN_PROGRESS",
      eta: "12 minutes away",
      notes: "Kitchen tap water leaking constantly from lower valve.",
    });

    await Job.create({
      booking: booking1._id,
      provider: providerUser1._id,
      customer: customer1._id,
      status: "STARTED",
      startedAt: new Date(Date.now() - 3600000),
      jobNotes: "Inspected sink piping. Replacing worn ceramic disk cartridge.",
      beforePhotos: ["https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80"],
    });

    await Invoice.create({
      invoiceNumber: "INV-2026-00124",
      booking: booking1._id,
      customer: customer1._id,
      provider: providerUser1._id,
      serviceName: "Tap & Mixer Repair",
      basePrice: 499,
      visitCharge: 0,
      finalAmount: 499,
      paymentStatus: "ISSUED",
    });

    // Booking 2: Confirmed Upcoming
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const booking2 = await Booking.create({
      bookingNumber: "ATD-2026-00131",
      customer: customer1._id,
      provider: providerUser2._id,
      category: catMap["ac-cooling"],
      serviceName: "AC General Service",
      scheduledDate: tomorrow,
      scheduledTime: "10:00 AM",
      address: {
        addressLine: "Flat 402, Green Glen Layout",
        area: "Bellandur",
        city: "Bengaluru",
      },
      price: 799,
      status: "CONFIRMED",
      eta: "Scheduled for tomorrow",
    });

    await Job.create({
      booking: booking2._id,
      provider: providerUser2._id,
      customer: customer1._id,
      status: "ASSIGNED",
    });

    await Invoice.create({
      invoiceNumber: "INV-2026-00131",
      booking: booking2._id,
      customer: customer1._id,
      provider: providerUser2._id,
      serviceName: "AC General Service",
      basePrice: 799,
      finalAmount: 799,
      paymentStatus: "ISSUED",
    });

    // Booking 3: Completed with Review
    const booking3 = await Booking.create({
      bookingNumber: "ATD-2026-00086",
      customer: customer1._id,
      provider: providerUser3._id,
      category: catMap["electrical"],
      serviceName: "Electrical Short Circuit Fix",
      scheduledDate: "2026-09-18",
      scheduledTime: "04:30 PM",
      address: {
        addressLine: "Flat 402, Green Glen Layout",
        area: "Bellandur",
        city: "Bengaluru",
      },
      price: 650,
      status: "COMPLETED",
    });

    await Job.create({
      booking: booking3._id,
      provider: providerUser3._id,
      customer: customer1._id,
      status: "COMPLETED",
      startedAt: new Date("2026-09-18T16:30:00Z"),
      completedAt: new Date("2026-09-18T17:45:00Z"),
      beforePhotos: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80"],
      afterPhotos: ["https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=80"],
      customerConfirmation: {
        confirmed: true,
        confirmedAt: new Date("2026-09-18T18:00:00Z"),
      },
    });

    await Invoice.create({
      invoiceNumber: "INV-2026-00086",
      booking: booking3._id,
      customer: customer1._id,
      provider: providerUser3._id,
      serviceName: "Electrical Short Circuit Fix",
      basePrice: 650,
      finalAmount: 650,
      paymentStatus: "PAID",
      paidAt: new Date("2026-09-18T18:05:00Z"),
    });

    await Review.create({
      booking: booking3._id,
      customer: customer1._id,
      provider: providerUser3._id,
      rating: 5,
      review: "Arjun was super professional! Identified the MCB trip in 10 minutes and replaced the faulty switch safely.",
      serviceQuality: 5,
      punctuality: 5,
      professionalism: 5,
    });

    // Dispute sample
    await Dispute.create({
      disputeNumber: "DISP-2026-1042",
      booking: booking1._id,
      customer: customer2._id,
      provider: providerUser2._id,
      reason: "Incorrect Charge",
      description: "Provider asked for extra ₹200 for gas charging which was already included in quote.",
      status: "UNDER_REVIEW",
      assignedAgent: supportAgent._id,
    });

    // Sample notifications
    await Notification.create([
      {
        user: customer1._id,
        title: "Provider on the way",
        message: "Ravi Kumar is 12 minutes away for your Tap & Mixer Repair.",
        type: "BOOKING",
      },
      {
        user: customer1._id,
        title: "Booking confirmed",
        message: "Your AC General Service appointment is scheduled for tomorrow at 10:00 AM.",
        type: "BOOKING",
      },
      {
        user: admin._id,
        title: "New Provider Application",
        message: "Pooja Sharma submitted documents for Deep Cleaning verification.",
        type: "SYSTEM",
      },
    ]);

    // Sample audit logs
    await AuditLog.create([
      {
        actor: admin._id,
        action: "PROVIDER_VERIFIED",
        entity: "ProviderProfile",
        entityId: String(provProfile1._id),
        details: "Identity and trade certifications verified.",
      },
      {
        actor: admin._id,
        action: "CATEGORY_CREATED",
        entity: "ServiceCategory",
        entityId: String(catMap["ac-cooling"]),
        details: "Created AC & Cooling category with base price ₹599.",
      },
    ]);

    console.log("[Seeder] Database seeded successfully!");
    console.log("-----------------------------------------------------------------");
    console.log("DEMO ACCOUNTS READY:");
    console.log("Admin:              admin@atdoor.com      / Admin@123");
    console.log("Operations Manager: operations@atdoor.com / Ops@123");
    console.log("Support Agent:      support@atdoor.com    / Support@123");
    console.log("Provider (Plumber): provider1@atdoor.com  / Provider@123");
    console.log("Provider (AC Tech): provider2@atdoor.com  / Provider@123");
    console.log("Customer:           customer@atdoor.com   / Customer@123");
    console.log("-----------------------------------------------------------------");

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error("[Seeder] Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
