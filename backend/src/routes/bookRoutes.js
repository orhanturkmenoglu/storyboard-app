import express from "express";
import cloudinary from "../config/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";
import Favorite from "../models/Favorite.js";
import redisClient from "../config/redis.client.js";

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
      cloudinaryId: uploadResponse.public_id,
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

    const userId = req.user._id.toString();
    const cacheKey = `books:${userId}:page:${page}:limit:${limit}`;

    console.log(`📄 Fetch books: page=${page}, limit=${limit}`);

    const cached = await redisClient(cacheKey);

    if (cached) {
      console.log("⚡ Cache'den getirildi.");
      return res.status(200).json(JSON.parse(cached));
    }

    const books = await Book.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments({ user: req.user._id });

    const responseData = {
      success: true,
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    };

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    return res.status(200).json({ responseData });
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
    const userId = req.user._id.toString();
    const cacheKey = `books:user:${userId}`;

    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log("⚡ Kullanıcı kitapları cache'den getirildi");
      return res.status(200).json({
        success: true,
        books: JSON.parse(cached),
        cached: true,
      });
    }

    const books = await Book.find({ user: req.user._id });

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(books));

    return res.status(200).json({
      success: true,
      books,
      cached: false,
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
    const userId = req.user._id.toString();
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

    const keys = await redisClient.keys(`books:${userId}*`);
    if (keys.length) await redisClient.del(keys);

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

/* ------------------------------------------------------
 🚀 ADD BOOK TO FAVORITES
-------------------------------------------------------*/
router.post("/favorites", protectRoute, async (req, res) => {
  try {
    const { bookId } = req.body;

    console.log("📥 Favorite add request:", { userId: req.user._id, bookId });

    // -------------------- VALIDATION --------------------
    if (!bookId) {
      return res
        .status(400)
        .json({ success: false, message: "Kitap ID boş bırakılamaz!" });
    }

    // -------------------- DB CHECK --------------------
    const book = await Book.findById(bookId);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Kitap bulunamadı" });
    }

    // -------------------- EXISTING FAVORITE CHECK --------------------
    const existFavorite = await Favorite.findOne({
      user: req.user._id,
      book: bookId,
    });
    if (existFavorite) {
      return res
        .status(409)
        .json({ success: false, message: "Favorilerde zaten kayıtlı" });
    }

    // -------------------- BUSINESS LOGIC --------------------
    const newFavorite = new Favorite({
      user: req.user._id,
      book: book._id,
      createdAt: new Date(),
    });

    await newFavorite.save();

    console.log("✅ Favorite added:", newFavorite._id);

    // -------------------- OUTPUT --------------------
    return res.status(201).json({
      success: true,
      message: "Kitap favorilere eklendi",
      favorite: newFavorite,
    });
  } catch (error) {
    console.error("❌ Favorite add error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

/* ------------------------------------------------------
 🚀 REMOVE BOOK FROM FAVORITES
-------------------------------------------------------*/
router.delete("/favorites/:bookId", protectRoute, async (req, res) => {
  try {
    const { bookId } = req.params;

    console.log("📥 Favorite remove request:", {
      userId: req.user._id,
      bookId,
    });

    const favorite = await Favorite.findOne({
      user: req.user._id,
      book: bookId,
    });

    if (!favorite) {
      return res
        .status(404)
        .json({ success: false, message: "Favorilerde kayıtlı değil" });
    }

    await favorite.deleteOne();

    console.log("✅ Favorite removed:", favorite._id);

    await redisClient.del(`books:favorite:${req.user._id}`);

    return res
      .status(200)
      .json({ success: true, message: "Favoriden çıkarıldı" });
  } catch (error) {
    console.error("❌ Favorite remove error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

/* ------------------------------------------------------
 📖 GET USER FAVORITES
-------------------------------------------------------*/
router.get("/favorites", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    const cacheKey = `books:favorite:${userId}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        cached,
        cached: true,
      });
    }
    const favorites = await Favorite.find({ user: req.user._id }).populate(
      "book"
    );

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(favorites));

    return res.status(200).json({
      success: true,
      favorites,
      cached: false,
    });
  } catch (error) {
    console.error("❌ Fetch favorites error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

export default router;
