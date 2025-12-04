import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Token doğrulama
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // decoded.id geliyor çünkü token içinde { id: userId } gönderdin
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ protectRoute error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Token verification failed.",
    });
  }
};

export default protectRoute;
