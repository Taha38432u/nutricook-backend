const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");

const userRouter = require("./routes/userRoutes");
const recipeRouter = require("./routes/recipeRoutes");
const commentRouter = require("./routes/commentRoutes");
const AppError = require("./utils/AppError");
const GlobalErrorHandler = require("./controllers/errorController");
const path = require("path");

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true); // Allow requests from any localhost port
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,POST,PUT,DELETE,PATCH", // Allowed HTTP methods
  allowedHeaders: "Content-Type, Authorization", // Allowed headers
  credentials: true, // Enable credentials (cookies, authorization headers)
};

app.use(cors(corsOptions));
app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: "Too many requests from this IP, please try again in an hour",
});

app.use("/api", limiter);

app.use(express.json());

app.use(mongoSanitize());

app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/api/v1/users", userRouter);
app.use("/api/v1/recipes", recipeRouter);
app.use("/api/v1/comments", commentRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(GlobalErrorHandler);

module.exports = app;
