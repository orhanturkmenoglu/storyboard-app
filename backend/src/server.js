import express from "express";
import "colors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dotenv yükle (src/config/.env)
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("Mongo URI test:", process.env.MONGODB_URI); 

// express
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connect
connectDB();

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`.green.bold);
});
