import express from "express";
import cloudinary from "../config/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

/* ------------------------------------------------------
 🚀 CREATE BOOK
-------------------------------------------------------*/
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    console.log("📥 BODY:", req.body);
    console.log("📤 Uploading image...");

    // Validation
    if (!title || !caption || !rating || !image) {
      return res.status(400).json({
        success: false,
        message: "Tüm alanlar zorunludur!",
      });
    }

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "books",
      resource_type: "auto",
    });

    console.log("Upload Respone : ", uploadResponse);

    const newBook = new Book({
      title,
      caption,
      rating,
      image: uploadResponse.secure_url,
      cloudinaryId:uploadResponse.public_id,
      user: req.user._id,
    });

    await newBook.save();

    console.log("📚 Book created:", newBook._id);

    return res.status(201).json({
      success: true,
      message: "Book created successfully",
      book: newBook,
    });
  } catch (error) {
    console.error("❌ Book create error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* ------------------------------------------------------
 📖 GET BOOKS (Pagination + Sort)
-------------------------------------------------------*/
router.get("/", protectRoute, async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 5;
    let skip = (page - 1) * limit;

    console.log(`📄 Fetch books: page=${page}, limit=${limit}`);

    const books = await Book.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();

    return res.status(200).json({
      success: true,
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.error("❌ Book fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* ------------------------------------------------------
 📖 GET BOOKS User
-------------------------------------------------------*/
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id });
    return res.status(200).json({
      success: true,
      books,
    });
  } catch (error) {
    console.error("❌ User books fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* ------------------------------------------------------
 ❌ DELETE BOOK
-------------------------------------------------------*/
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const bookId = req.params.id;
    console.log("🗑 Delete request for:", bookId);

    const book = await Book.findById(bookId);
    console.log("🔍 Book Found:", book ? "YES" : "NO");

    if (!book) {
      console.log("❌ Book not found in DB");
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    console.log("📚 Book Owner ID:", book.user.toString());
    console.log("🧑 Current User ID:", req.user._id.toString());

    if (book.user.toString() !== req.user._id.toString()) {
      console.log("⛔ Unauthorized delete attempt!");
      return res.status(403).json({
        success: false,
        message: "Bu kitabı silme yetkin yok!",
      });
    }

    console.log("🖼 Cloudinary Public ID:", book.cloudinaryId);

    // Delete image from Cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      try {
        await cloudinary.uploader.destroy(book.cloudinaryId);
        console.log("🗑 Cloudinary image deleted");
      } catch (deleteError) {
        console.log("Error deleting image from cloudinary", deleteError);
      }
    }

    // Remove from DB
    await book.deleteOne();
    console.log("📚 Book deleted from DB");

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("❌ Book delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
