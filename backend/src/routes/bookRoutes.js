import express from "express";
import cloudinary from "../config/cloudinary";
import Book from "../models/Book";

const router = express();

router.post("/",protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    console.log("📘 Create book request:", { title, rating });

    // Required fields
    if (!title || !caption || !rating || !image) {
      console.log("❌ Missing fields");
      return res.status(400).json({
        success: false,
        message: "Tüm alanlar zorunludur!",
      });
    }

    // Upload image to Cloudinary
    console.log("📤 Uploading image to Cloudinary...");

    const uploadResponse = await cloudinary.uploader.upload(image);
    console.log("UploadResponse :", uploadResponse);

    const imageUrl = uploadResponse.secure_url;

    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id,
    });

    await newBook.save();
    console.log(`📚 New book created by user ${req.userId}`);

    return res.status(201).json({
      success: true,
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    console.error("❌ Book create error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
