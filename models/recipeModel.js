const mongoose = require("mongoose");

const nutrientSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 }, // Total calories
  protein: { type: Number, default: 0 }, // Protein in grams
  fat: { type: Number, default: 0 }, // Fat in grams
  carbohydrates: { type: Number, default: 0 }, // Carbs in grams
  vitamins: { type: Map, of: String }, // Additional vitamins (e.g., Vitamin A: 20%)
});

const ingredientSchema = new mongoose.Schema({
  ingName: { type: String, required: true },
  nutrients: { type: nutrientSchema, required: true }, // Nutrient values for each ingredient
});

// Recipe Schema
const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true }, // Short description of the recipe
    ingredients: { type: [ingredientSchema], required: true }, // Array of ingredient objects
    instructions: { type: [String], required: true }, // Step-by-step guide
    preparationTime: { type: Number, required: true }, // Preparation time in minutes
    cookingTime: { type: Number, required: true }, // Cooking time in minutes
    cuisine: { type: String, required: true, trim: true }, // Cuisine type (e.g., Italian)
    dietaryPreferences: { type: [String] }, // Array of dietary preferences (e.g., vegan)
    image: { type: String, required: false }, // URL or path for the recipe image
    likes: { type: Number, default: 0 },
    comments: { type: [mongoose.Schema.Types.ObjectId], ref: "Comment" }, // Array of comment IDs
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // User ID of the author
    createdAt: { type: Date, default: Date.now }, // Creation timestamp
    totalNutrients: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      carbohydrates: { type: Number, default: 0 },
      vitamins: { type: Map, of: String },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual populate for userName based on createdBy
recipeSchema.virtual("userName", {
  ref: "User", // The model to use for population
  localField: "createdBy", // Field in the Recipe schema
  foreignField: "_id", // Field in the User schema
  justOne: true, // Returns a single user document
  options: { select: "name" }, // Only fetch the 'name' field from the User model
});

// Method to calculate total nutrients
recipeSchema.methods.calculateTotalNutrients = function () {
  const totalNutrients = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbohydrates: 0,
    vitamins: new Map(),
  };

  // Iterate over ingredients to sum up the nutrients
  this.ingredients.forEach((ingredient) => {
    totalNutrients.calories += ingredient.nutrients.calories;
    totalNutrients.protein += ingredient.nutrients.protein;
    totalNutrients.fat += ingredient.nutrients.fat;
    totalNutrients.carbohydrates += ingredient.nutrients.carbohydrates;

    // Summing vitamins
    ingredient.nutrients.vitamins.forEach((value, key) => {
      if (totalNutrients.vitamins.has(key)) {
        totalNutrients.vitamins.set(
          key,
          totalNutrients.vitamins.get(key) + parseFloat(value),
        );
      } else {
        totalNutrients.vitamins.set(key, parseFloat(value));
      }
    });
  });

  this.totalNutrients = totalNutrients;
  return this.totalNutrients;
};

// Call the calculateTotalNutrients method before saving
recipeSchema.pre("save", function (next) {
  this.calculateTotalNutrients();
  next();
});

module.exports = mongoose.model("Recipe", recipeSchema);
