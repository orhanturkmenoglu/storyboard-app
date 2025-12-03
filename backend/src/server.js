import app from "./app.js";
import "colors";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// dotenv yükle (src/config/.env)
dotenv.config({ path: path.resolve("./config/.env") });

console.log("Mongo URI test:", process.env.MONGODB_URI); 

const PORT = process.env.PORT || 3000;

// MongoDB connect
connectDB();

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`.green.bold);
});
