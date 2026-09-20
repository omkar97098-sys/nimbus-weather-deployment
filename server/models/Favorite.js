import mongoose from "mongoose";
import { randomUUID } from "crypto";

const favoriteSchema = new mongoose.Schema({
  _id: { type: String, default: () => randomUUID() },
  name: { type: String, required: true },
  country: { type: String, default: "" },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

favoriteSchema.index(
  { name: 1, country: 1, lat: 1, lon: 1 },
  { unique: true }
);

export default mongoose.model("Favorite", favoriteSchema);