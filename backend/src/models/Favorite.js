import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Unique kombinasyon: aynı kullanıcı aynı kitabı favorilere birden fazla ekleyemez
    timestamps: true,
  }
);

// Unique index ile aynı kullanıcı aynı kitabı tekrar ekleyemez
favoriteSchema.index({ user: 1, book: 1 }, { unique: true });


const Favorite = mongoose.model("Favorite",favoriteSchema);

export default Favorite;