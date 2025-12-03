import express from "express";
import authRoutes from "./routes/authRoutes.js";
import "dotenv";

const app = express();

app.use("/api/auth",authRoutes);


export default app;

