import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
import logger from "../logger.js"

export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(401).send({ message: "Name is required!" });
    }

    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(200).send({
        success: true,
        message: "Category Already Exists, create another!",
      });
    }
    const category = await new categoryModel({
      name,
      slug: slugify(name), // slugify the name to remove white spaces and make it lowercase
    }).save();

    res.status(201).send({
      success: true,
      message: "New category created 🥳",
      category,
    });
  } 
  catch (error) {
    logger.log(error);
    res.status(500).send({
      success: false,
      errro,
      message: "Error in Category!",
    });
  }
};

//update category
export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true } // This new property should be true to return the updated document
    );
    res.status(200).send({
      success: true,
      messsage: "Category Updated Successfully!",
      category,
    });
  } 
  catch (error) {
    logger.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while updating category!",
    });
  }
};

// get all cat
export const categoryControlller = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "All Categories List is here...",
      category,
    });
  } catch (error) {
    logger.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all categories!",
    });
  }
};

// single category
export const singleCategoryController = async (req, res) => {
  try {
    // const {slug} = req.params;
    // const category = await categoryModel.findOne({slug});
    const category = await categoryModel.findOne({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: "Get Single Category Successfull!",
      category,
    });
  } 
  catch (error) {
    logger.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While getting Single Category!",
    });
  }
};

//delete category
export const deleteCategoryCOntroller = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Category Deleted Successfully!",
    });
  } 
  catch (error) {
    logger.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting category!",
      error,
    });
  }
};