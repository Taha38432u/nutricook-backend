const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
//   console.log(err);
  process.exit(1);
});

dotenv.config({ path: "../conf.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {});

const app = require("../app");

const port = process.env.PORT || 3001; // Use a higher port if permission issues persist
const server = app.listen(port, () => {
//   console.log(`App running on port ${port} in ${process.env.NODE_ENV} mode`);
});

process.on("unhandledRejection", (err) => {
//   console.log(err);
  server.close(() => {
    process.exit(1); // 1 stands for uncaught exception
  });
});
