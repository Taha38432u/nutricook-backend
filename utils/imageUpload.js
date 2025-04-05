const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Store images in memory for processing
const multerStorage = multer.memoryStorage();

// Only accept images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new Error("Not an image! Please upload only images."), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const processRecipeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "fail",
        message: "No image file uploaded.",
      });
    }

    const filename = `recipe-${Date.now()}.jpeg`;
    const outputPath = path.join(__dirname, "../images", filename);

    // Ensure folder exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Process the image with sharp
    await sharp(req.file.buffer)
      .resize(800, 600, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFormat("jpeg")
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    // Send the image path directly in the response
    return res.status(200).json({
      status: "success",
      message: "Image uploaded and processed successfully",
      imagePath: `/images/${filename}`,
    });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};

module.exports = {
  uploadRecipeImage: upload.single("image"),
  processRecipeImage,
};
