import mongoose from "mongoose";
import { env } from "./env";

export async function connectMongo() {
  try {
    await mongoose.connect(env.mongoUrl);
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB connection error ❌", err);
  }
}
