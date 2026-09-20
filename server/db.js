import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nimbus";

export async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
    });

    console.log(`MongoDB connected: ${MONGODB_URI}`);
    return true;
  } catch (err) {
    console.warn(
      `MongoDB unavailable (${err.message}). Falling back to file storage.`
    );
    return false;
  }
}