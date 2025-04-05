class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    // console.log(queryObj);
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Handle inclusion of ingredients
    if (queryObj.includeIngredients) {
      // Convert comma-separated string to an array of ingredients
      const includeIngredients = queryObj.includeIngredients
        .split(",")
        .map((ingredient) => ingredient.trim().toLowerCase());

      // Use $regex for flexible matching on ingredient names
      this.query = this.query.find({
        "ingredients.ingName": {
          $in: includeIngredients.map(
            (ingredient) => new RegExp(ingredient, "i"),
          ),
        },
      });
      delete queryObj.includeIngredients; // Remove includeIngredients field from query
    }

    // Handle exclusion of ingredients
    if (queryObj.excludeIngredients) {
      // Convert comma-separated string to an array of ingredients
      const excludeIngredients = queryObj.excludeIngredients
        .split(",")
        .map((ingredient) => ingredient.trim().toLowerCase());

      // Use $regex for flexible matching on ingredient names
      this.query = this.query.find({
        "ingredients.ingName": {
          $nin: excludeIngredients.map(
            (ingredient) => new RegExp(ingredient, "i"),
          ),
        },
      });
      delete queryObj.excludeIngredients; // Remove excludeIngredients field from query
    }

    // Handle Cuisine
    if (queryObj.cuisine) {
      const cuisineArray = queryObj.cuisine
        .split(",")
        .map((cuisine) => cuisine.trim());

      // console.log(cuisineArray);

      // Use the $in operator to match any of the cuisines
      this.query = this.query.find({
        cuisine: { $in: cuisineArray },
      });

      delete queryObj.cuisine; // Remove the cuisine field after processing
    }

    // Handle totalNutrients fields dynamically
    const nutrients = ["calories", "protein", "fat", "carbohydrates"];
    nutrients.forEach((nutrient) => {
      if (queryObj[nutrient]) {
        queryObj[`totalNutrients.${nutrient}`] = queryObj[nutrient];
        delete queryObj[nutrient];
      }
    });

    // Stringify and replace operators like gte, gt, lte, lt with $gte, $gt, $lte, $lt
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // Ensure single $

    // Parse numbers to ensure they are not treated as strings in MongoDB query
    const parsedQuery = JSON.parse(queryStr, (key, value) => {
      if (!isNaN(value) && key !== "") {
        return parseFloat(value);
      }
      return value;
    });

    this.query = this.query.find(parsedQuery);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // Split the sort parameters and map to correct field paths
      const sortBy = this.queryString.sort
        .split(",")
        .map((field) => {
          const cleanedField = field.replace("-", ""); // Remove "-" for comparison
          // Map nutrient fields to nested paths
          if (
            ["calories", "protein", "fat", "carbohydrates"].includes(
              cleanedField,
            )
          ) {
            return field.startsWith("-")
              ? `-totalNutrients.${cleanedField}`
              : `totalNutrients.${cleanedField}`;
          }
          return field; // Return the field as-is if it's not a nutrient
        })
        .join(" ");

      // console.log("Sorting by:", sortBy); // Debugging: Log the sort string
      this.query = this.query.sort(sortBy);
    } else {
      // console.log("Default sorting by -createdAt");
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  /*  sort() {
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(",").join(" ");
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort("-createdAt");
      }
  
      return this;
    }*/

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
