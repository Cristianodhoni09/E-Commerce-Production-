import mongoose from "mongoose";
import colors from "colors";
import logger from "../logger.js";

const connectDB = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGO_URL);
    logger.log(
      `Connected to MongoDB Database: ${con.connection.host}`.bgMagenta.white
    );
  } 
  catch (error) {
    logger.error(`Error in MongoDB: ${error.message}`.bgRed.white);
    process.exit(1);
  }
};

export default connectDB;
