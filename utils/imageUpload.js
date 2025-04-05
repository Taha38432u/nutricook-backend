const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("./cloudinary");
const streamifier = require("streamifier");

// Store images in memory
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

    // Process image with sharp
    const buffer = await sharp(req.file.buffer)
      .resize(800, 600, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFormat("jpeg")
      .jpeg({ quality: 85 })
      .toBuffer();

    // Upload to Cloudinary using stream
    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "recipes" }, // optional folder
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });

    const result = await streamUpload();

    // Return Cloudinary URL
    return res.status(200).json({
      status: "success",
      message: "Image uploaded to Cloudinary",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadRecipeImage: upload.single("image"),
  processRecipeImage,
};
