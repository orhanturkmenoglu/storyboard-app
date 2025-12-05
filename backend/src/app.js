import express from "express";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import "dotenv";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());


app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

export default app;
