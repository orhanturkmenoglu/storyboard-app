import mongoose from "mongoose";
import colors from "colors";
import dotenv from "dotenv";
import path  from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dotenv yükle (server.js ile aynı klasördeki .env)
dotenv.config({ path: path.resolve(__dirname, ".env") });

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(MONGODB_URI);
    console.log(
      colors.bgMagenta(`✅ Connected to MongoDB: ${connection.host}`)
    ); 
  } catch (error) {
    console.error(colors.red(`❌ MongoDB connection error: ${error.message}`));
    process.exit(1);
  }
};

export default connectDB;
