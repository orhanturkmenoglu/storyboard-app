import express from "express";
import authRoutes from "./routes/authRoutes.js";
import "dotenv";

const app = express();

app.use(express.json());

app.use("/api/auth",authRoutes);

app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

export default app;

