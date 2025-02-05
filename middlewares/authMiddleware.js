import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import logger from "../logger.js"

//Protected Routes token base
export const requireSignIn = async (req, res, next) => {
  const token = req.headers.authorization; // Extract the token.
  
  if (!token) {
    return res.status(401).send({ message: "Authorization token required" });
  }
  
  try {
    const decode = JWT.verify(
      token,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } 
  catch (error) {
    logger.log(error);
  }
};

//admin acceess
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access!!",
      });
    } 
    else {
      next();
    }
  } 
  catch (error) {
    logger.log(error);
    res.status(401).send({
      success: false,
      error,
      message: "Error in admin middelware...",
    });
  }
};