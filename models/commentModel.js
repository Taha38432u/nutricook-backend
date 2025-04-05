const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true }, // The actual comment
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The user who posted the comment
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    }, // The recipe the comment is related to
    createdAt: { type: Date, default: Date.now }, // Timestamp
  },
  { timestamps: true },
);

module.exports = mongoose.model("Comment", commentSchema);
