import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("src/config/.env") });

console.log("🔎 Cloudinary ENV CHECK:", {
  CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  API_KEY: process.env.CLOUDINARY_API_KEY ? "✔ Loaded" : "❌ Missing",
  API_SECRET: process.env.CLOUDINARY_API_SECRET ? "✔ Loaded" : "❌ Missing",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
