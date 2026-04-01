const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in environment variables.");
  }

  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(mongoUri);
  return conn;
};

module.exports = connectDB;
