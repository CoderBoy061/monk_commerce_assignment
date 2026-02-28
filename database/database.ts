import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "../utils/logger";

dotenv.config();

const mongoUri =
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/monk_commerce";

// connect to the database
export const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    logger.info("MongoDB connected successfully");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("MongoDB connection failed", { error: message });
    process.exit(1);
  }
};
