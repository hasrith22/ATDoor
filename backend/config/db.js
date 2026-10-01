const mongoose = require("mongoose");

let mongodInstance = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/atdoor";

  try {
    // Attempt connecting to the configured MongoDB URI (local or Atlas)
    console.log(`[Database] Attempting connection to: ${primaryUri.split("@").pop()}`);
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("[Database] Connected successfully to primary MongoDB instance.");
  } catch (err) {
    console.warn("[Database] Primary MongoDB not reachable:", err.message);
    console.log("[Database] Initializing fallback embedded MongoMemoryServer for development...");
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Connected to in-memory fallback database at ${inMemoryUri}`);
    } catch (fallbackErr) {
      console.error("[Database] Critical failure connecting to fallback MongoDB:", fallbackErr.message);
      throw fallbackErr;
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
