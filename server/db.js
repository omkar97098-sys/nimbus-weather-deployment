import "dotenv/config";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || null;

export const mongoRequired = Boolean(MONGO_URI);

const MAX_ATTEMPTS = Number(process.env.MONGO_MAX_ATTEMPTS) || 5;
const RETRY_DELAY_MS = Number(process.env.MONGO_RETRY_DELAY_MS) || 3000;

function redactUri(uri) {
  if (!uri) return uri;
  return uri.replace(/\/\/([^@]+)@/, "//***@");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getDbStatus() {
  return mongoose.connection.readyState === 1 ? "connected" : "error";
}

export async function connectDatabase() {
  if (!MONGO_URI) {
    console.warn(
      "[db] MONGO_URI is not set. Favorites will be stored in a local file (local-dev mode)."
    );
    return false;
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 4000,
      });

      console.log(`[db] MongoDB connected (${redactUri(MONGO_URI)})`);
      return true;
    } catch (err) {
      console.error(
        `[db] MongoDB connection attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err.message}`
      );

      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  console.error(
    `[db] MongoDB could not be reached at ${redactUri(MONGO_URI)} after ${MAX_ATTEMPTS} attempts.`
  );
  return false;
}