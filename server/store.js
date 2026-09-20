import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import mongoose from "mongoose";
import Favorite from "./models/Favorite.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE_PATH = path.join(__dirname, "data", "favorites.json");

function dbActive() {
  return mongoose.connection.readyState === 1;
}

async function readFile() {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFile(favorites) {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(
    FILE_PATH,
    JSON.stringify(favorites, null, 2),
    "utf8"
  );
}

async function findExisting(name, country, lat, lon) {
  if (dbActive()) {
    return Favorite.findOne({ name, country, lat, lon }).lean();
  }

  const all = await readFile();
  return (
    all.find(
      (f) =>
        f.name === name &&
        f.country === country &&
        f.lat === lat &&
        f.lon === lon
    ) || null
  );
}

export async function getFavorites() {
  if (dbActive()) {
    return Favorite.find().sort({ createdAt: -1 }).lean();
  }

  return readFile();
}

export async function addFavorite({ name, country = "", lat, lon }) {
  const existing = await findExisting(name, country, lat, lon);

  if (existing) {
    return { favorite: existing, duplicate: true };
  }

  const favorite = {
    _id: randomUUID(),
    name,
    country,
    lat,
    lon,
    createdAt: new Date().toISOString(),
  };

  if (dbActive()) {
    const doc = await Favorite.create(favorite);
    return { favorite: doc.toObject(), duplicate: false };
  }

  const all = await readFile();
  all.unshift(favorite);
  await writeFile(all);

  return { favorite, duplicate: false };
}

export async function removeFavorite(id) {
  if (dbActive()) {
    const res = await Favorite.deleteOne({ _id: id });
    return res.deletedCount > 0;
  }

  const all = await readFile();
  const next = all.filter((f) => f._id !== id);

  if (next.length === all.length) return false;

  await writeFile(next);
  return true;
}