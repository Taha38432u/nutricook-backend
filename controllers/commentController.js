const Comment = require("../models/commentModel");
const Recipe = require("../models/recipeModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.createComment = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const comment = await Comment.create(req.body);

  await Recipe.findByIdAndUpdate(
    req.body.recipe,
    { $push: { comments: comment._id } },
    { new: true, useFindAndModify: false },
  );
  res.status(200).json({
    data: {
      comment,
    },
  });
});

exports.getCommentsForRecipe = catchAsync(async (req, res, next) => {
  const { recipeId } = req.params; // Extract recipe ID from route parameters

  // Check if the recipe exists
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    return next(new AppError("Recipe not found", 404));
  }

  // Fetch the comments with pagination
  const comments = await Comment.find({ recipe: recipeId })
    .sort({ createdAt: -1 }) // Sort by newest first
    .populate({
      path: "user",
      select: "name", // Select user details if required
    });

  // Total number of comments for the recipe
  const totalComments = await Comment.countDocuments({ recipe: recipeId });

  res.status(200).json({
    status: "success",
    results: comments.length,
    totalComments,
    data: {
      comments,
    },
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const { id } = req.params; // Extract comment ID from route parameters
  const userId = req.user._id; // Assume the user ID is available in `req.user`

  // Find the comment to verify ownership
  const comment = await Comment.findById(id);

  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }

  // Check if the logged-in user owns the comment
  if (!comment.user.equals(userId)) {
    return next(
      new AppError("You do not have permission to update this comment", 403),
    );
  }

  // Update the comment with new content
  const updatedComment = await Comment.findByIdAndUpdate(
    id,
    { text: req.body.text }, // Only allow updating the content
    { new: true, runValidators: true },
  );

  res.status(200).json({
    status: "success",
    data: {
      comment: updatedComment,
    },
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const { id } = req.params; // Extract comment ID from route parameters
  const userId = req.user._id; // Assume the user ID is available in `req.user`

  // Find the comment to verify ownership
  const comment = await Comment.findById(id);

  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }

  // Check if the logged-in user owns the comment
  if (!comment.user.equals(userId)) {
    return next(
      new AppError("You do not have permission to delete this comment", 403),
    );
  }

  // Delete the comment
  await Comment.deleteOne({ _id: id });

  // Optionally, you can remove the comment from the associated recipe's comments list
  await Recipe.findByIdAndUpdate(
    comment.recipe,
    { $pull: { comments: id } }, // Remove the comment ID from the recipe's comments array
    { new: true, useFindAndModify: false },
  );

  res.status(204).json({
    status: "success",
    message: "Comment deleted successfully",
  });
});
