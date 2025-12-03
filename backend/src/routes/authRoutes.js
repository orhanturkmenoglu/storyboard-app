import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

/* -------------------- TOKEN ÜRET -------------------- */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.SECRET_KEY, {
    expiresIn: "8h",
  });
};

/* =====================================================
   🚀 REGISTER
===================================================== */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log("\n🔹 REGISTER ATTEMPT:", {
      username,
      email,
    });

    // 1) Validation
    if (!username || !email || !password) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Zorunlu alanlar doldurulmalıdır!",
      });
    }

    if (username.length < 3) {
      console.log("❌ Username too short");
      return res.status(400).json({
        success: false,
        message: "Kullanıcı adı en az 3 karakter olmalıdır!",
      });
    }

    if (password.length < 6) {
      console.log("❌ Password too short");
      return res.status(400).json({
        success: false,
        message: "Şifre en az 6 karakter olmalıdır!",
      });
    }

    // 2) Check existing username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log("❌ Username already exists");
      return res.status(400).json({
        success: false,
        message: "Kullanıcı adı mevcut!",
      });
    }

    // 3) Check existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log("❌ Email already exists");
      return res.status(400).json({
        success: false,
        message: "Kullanıcı email mevcut!",
      });
    }

    // 4) Random avatar
    const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`;

    // 5) Create user
    const user = new User({ username, email, password, profileImage });
    await user.save();

    console.log(`✅ USER CREATED: ${username} (${email})`);

    // 6) Token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Successfully new user created",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error("❌ REGISTER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =====================================================
   🔐 LOGIN
===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("\n🔹 LOGIN ATTEMPT:", { email });

    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1) Check user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ message: "User does not exist" });
    }

    // 2) Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      console.log("❌ Wrong password attempt");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log(`✅ LOGIN SUCCESS: ${user.username}`);

    // 3) Token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
