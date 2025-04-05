const express = require("express");
const authController = require("../controllers/authenticationControlller");
const commentController = require("../controllers/commentController");
const router = express.Router();

router.get("/:recipeId", commentController.getCommentsForRecipe);

router.use(authController.protect);
router.post("/", commentController.createComment);
router
  .route("/:id")
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

module.exports = router;
