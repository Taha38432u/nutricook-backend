const express = require("express");
const recipeController = require("../controllers/recipeController");
const authController = require("../controllers/authenticationControlller");
const userController = require("../controllers/userController");
const likeController = require("../controllers/likeController");

const router = express.Router();

// Public Route: Get all recipes (accessible by anyone)
router.route("/").get(recipeController.getAllRecipes);

// Protect all the routes below with the authentication middleware
router.use(authController.protect);

// User routes
router.route("/").post(recipeController.createRecipe);

// Get the current user's recipes
router.get("/me", userController.getMe, recipeController.getUserRecipes);

// Get Nutrients
router.post("/nutrients", recipeController.getNutrients);

// Toggle Like
router.patch("/like/:id", likeController.toggleLike);
router.get(
  "/likedRecipes",
  userController.getMe,
  likeController.getLikedRecipes
);

// Admin can fetch all recipes
router.get(
  "/all",
  authController.restrictTo("admin"),
  recipeController.setGetAllFlag, // Set the getAll flag for admins
  recipeController.getAllRecipes // Get all recipes for admins
);

// Dynamic route for individual recipes
router
  .route("/:id")
  .get(recipeController.getRecipe)
  .patch(recipeController.updateRecipe)
  .delete(recipeController.deleteRecipe);

module.exports = router;
