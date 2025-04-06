const axios = require("axios");
const Recipe = require("../models/recipeModel");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");
// const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const Like = require("../models/likeModel");
// const copy = require("fast-copy").default; // Use `.default` to access the function

exports.createRecipe = catchAsync(async (req, res) => {
  const {
    title,
    description,
    ingredients,
    instructions,
    preparationTime,
    cookingTime,
    cuisine,
    dietaryPreferences,
    image,
  } = req.body;

  const updatedIngredients = [];

  for (let ingredient of ingredients) {
    const nutritionResponse = await axios.get(
      `https://api.edamam.com/api/nutrition-data`,
      {
        headers: { "Content-Type": "application/json" },
        params: {
          app_id: process.env.EDAMAM_APP_ID,
          app_key: process.env.EDAMAM_APP_KEY,
          nutrition_type: "cooking",
          ingr: ingredient.ingName,
        },
      }
    );

    const ingredientNutrients = nutritionResponse.data;

    if (ingredientNutrients) {
      updatedIngredients.push({
        ingName: ingredient.ingName,
        nutrients: {
          calories: ingredientNutrients.totalNutrients.ENERC_KCAL.quantity || 0,
          protein: ingredientNutrients.totalNutrients.PROCNT.quantity || 0,
          fat: ingredientNutrients.totalNutrients.FAT.quantity || 0,
          carbohydrates:
            ingredientNutrients.totalNutrients.CHOCDF.quantity || 0,
          vitamins: {
            sodium: ingredientNutrients.totalNutrients.NA.quantity || 0,
            potassium: ingredientNutrients.totalNutrients.K.quantity || 0,
            cholesterol: ingredientNutrients.totalNutrients.CHOLE.quantity || 0,
            fiber: ingredientNutrients.totalNutrients.FIBTG.quantity || 0,
            sugar: ingredientNutrients.totalNutrients.SUGAR.quantity || 0,
          },
        },
      });
    }
  }

  const newRecipe = new Recipe({
    title,
    description,
    ingredients: updatedIngredients,
    instructions,
    preparationTime,
    cookingTime,
    cuisine,
    dietaryPreferences,
    image,
    createdBy: req.user.id,
  });

  const savedRecipe = await newRecipe.save();

  res.status(201).json(savedRecipe);
});

exports.getNutrients = catchAsync(async (req, res, next) => {
  const { ingredients } = req.body;
  const updatedIngredients = [];

  // Loop through each ingredient and get its nutritional data
  for (let ingredient of ingredients) {
    // Call Edamam's API to fetch nutritional data for each ingredient
    const nutritionResponse = await axios.get(
      `https://api.edamam.com/api/nutrition-data`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          app_id: process.env.EDAMAM_APP_ID,
          app_key: process.env.EDAMAM_APP_KEY,
          nutrition_type: "cooking", // Set this to 'cooking' as per API documentation
          ingr: ingredient.ingName, // Pass each ingredient name as a query parameter
        },
      }
    );

    // Extract and format the nutrient data for the ingredient
    const ingredientNutrients = nutritionResponse.data;

    if (ingredientNutrients) {
      // Push the ingredient with its nutrient data into the updatedIngredients array
      updatedIngredients.push({
        ingName: ingredient.ingName,
        nutrients: {
          calories: ingredientNutrients.totalNutrients.ENERC_KCAL.quantity || 0,
          protein: ingredientNutrients.totalNutrients.PROCNT.quantity || 0,
          fat: ingredientNutrients.totalNutrients.FAT.quantity || 0,
          carbohydrates:
            ingredientNutrients.totalNutrients.CHOCDF.quantity || 0,
          vitamins: {
            sodium: ingredientNutrients.totalNutrients.NA.quantity || 0,
            potassium: ingredientNutrients.totalNutrients.K.quantity || 0,
            cholesterol: ingredientNutrients.totalNutrients.CHOLE.quantity || 0,
            fiber: ingredientNutrients.totalNutrients.FIBTG.quantity || 0,
            sugar: ingredientNutrients.totalNutrients.SUGAR.quantity || 0,
          },
        },
      });
    }
  }

  // Send Response

  res.status(200).json({
    status: "success",
    data: {
      updatedIngredients,
    },
  });
});

// Update Recipe
exports.updateRecipe = catchAsync(async (req, res, next) => {
  const { id } = req.params; // Recipe ID from URL parameters
  const {
    title,
    description,
    ingredients,
    instructions,
    preparationTime,
    cookingTime,
    cuisine,
    dietaryPreferences,
    image,
  } = req.body;

  // Find the recipe to update
  const recipe = await Recipe.findById(id);

  if (!recipe) {
    return next(new AppError("Recipe not found", 404)); // If recipe not found, return error
  }

  if (recipe.createdBy.toString() !== req.user.id) {
    return next(
      new AppError("You do not have permission to update this recipe", 403)
    );
  }

  // Prepare an array to store updated ingredients with nutrient data
  const updatedIngredients = [];

  // Loop through each ingredient and get its nutritional data
  for (let ingredient of ingredients) {
    // Call Edamam's API to fetch nutritional data for each ingredient
    const nutritionResponse = await axios.get(
      `https://api.edamam.com/api/nutrition-data`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          app_id: process.env.EDAMAM_APP_ID,
          app_key: process.env.EDAMAM_APP_KEY,
          nutrition_type: "cooking", // Set this to 'cooking' as per API documentation
          ingr: ingredient.ingName, // Pass each ingredient name as a query parameter
        },
      }
    );

    // Extract and format the nutrient data for the ingredient
    const ingredientNutrients = nutritionResponse.data;

    if (ingredientNutrients) {
      // Push the ingredient with its nutrient data into the updatedIngredients array
      updatedIngredients.push({
        ingName: ingredient.ingName,
        nutrients: {
          calories: ingredientNutrients.totalNutrients.ENERC_KCAL.quantity || 0,
          protein: ingredientNutrients.totalNutrients.PROCNT.quantity || 0,
          fat: ingredientNutrients.totalNutrients.FAT.quantity || 0,
          carbohydrates:
            ingredientNutrients.totalNutrients.CHOCDF.quantity || 0,
          vitamins: {
            sodium: ingredientNutrients.totalNutrients.NA.quantity || 0,
            potassium: ingredientNutrients.totalNutrients.K.quantity || 0,
            cholesterol: ingredientNutrients.totalNutrients.CHOLE.quantity || 0,
            fiber: ingredientNutrients.totalNutrients.FIBTG.quantity || 0,
            sugar: ingredientNutrients.totalNutrients.SUGAR.quantity || 0,
          },
        },
      });
    }
  }

  // Update the recipe fields with the new data
  recipe.title = title || recipe.title;
  recipe.description = description || recipe.description;
  recipe.ingredients = updatedIngredients.length
    ? updatedIngredients
    : recipe.ingredients; // Update ingredients only if new ingredients are provided
  recipe.instructions = instructions || recipe.instructions;
  recipe.preparationTime = preparationTime || recipe.preparationTime;
  recipe.cookingTime = cookingTime || recipe.cookingTime;
  recipe.cuisine = cuisine || recipe.cuisine;
  recipe.dietaryPreferences = dietaryPreferences || recipe.dietaryPreferences;

  // Save the updated recipe to the database
  const updatedRecipe = await recipe.save();

  res.status(200).json({
    status: "success",
    data: {
      recipe: updatedRecipe,
    },
  });
});

exports.deleteRecipe = catchAsync(async (req, res, next) => {
  const { id } = req.params; // Recipe ID from URL parameters

  // Find the recipe to delete
  const recipe = await Recipe.findById(id);

  if (!recipe) {
    return next(new AppError("Recipe not found", 404)); // If recipe not found, return error
  }

  if (recipe.createdBy.toString() !== req.user.id) {
    return next(
      new AppError("You do not have permission to update this recipe", 403)
    );
  }

  // Delete all likes associated with this recipe
  await Like.deleteMany({ recipe: id });

  // Delete the recipe itself
  await Recipe.findByIdAndDelete(id);

  // Return a success message
  res.status(204).json({
    status: "success",
    message: "Recipe and associated comments deleted successfully",
  });
});

exports.getUserRecipes = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Recipe.find({ createdBy: req.user.id }).populate("userName"),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Exclude the createdBy field explicitly
  // features.query = features.query.select("-createdBy");

  // Execute the query
  const recipes = await features.query;

  // Find all recipes created by this user
  // const recipes = await Recipe.find({ createdBy: id });

  // Return the recipes in the response
  res.status(200).json({
    status: "success",
    results: recipes.length, // Number of recipes returned
    data: {
      recipes,
    },
  });
});

// Get Single Recipe
exports.getRecipe = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const recipe = await Recipe.findById(id).populate("userName").lean();

  if (!recipe) {
    return next(new AppError("Recipe not found", 404));
  }

  // Deep copy the recipe object
  // const recipeObject = copy(recipe.toObject());

  // Remove unwanted fields
  delete recipe.createdBy;
  if (recipe.userName) {
    delete recipe.userName._id;
  }

  res.status(200).json({
    status: "success",
    data: {
      recipe,
    },
  });
});

exports.getAllRecipes = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Recipe.find().populate("userName"), // Populate the virtual field
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Execute the query
  const recipes = await features.query;

  // Remove the `createdBy` field from the response

  if (!req.body.getAll) {
    const sanitizedRecipes = recipes.map((recipe) => {
      const recipeObject = recipe.toObject(); // Convert Mongoose document to plain object
      delete recipeObject.createdBy; // Remove the field
      delete recipeObject.userName._id;
      delete recipeObject.userName.id;
      return recipeObject;
    });

    res.status(200).json({
      status: "success",
      results: sanitizedRecipes.length, // Number of recipes returned
      data: {
        recipes: sanitizedRecipes, // Send sanitized recipes
      },
    });
  } else {
    res.status(200).json({
      status: "success",
      results: recipes.length, // Number of recipes returned
      data: {
        recipes: recipes, // Send sanitized recipes
      },
    });
  }
});

exports.setGetAllFlag = (req, res, next) => {
  req.body.getAll = true;
  next();
};
