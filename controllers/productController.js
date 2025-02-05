import productModel from "../models/productModel.js";
import fs from "fs";
import slugify from "slugify";
import categoryModel from "../models/categoryModel.js"

//Payment Gateway
import braintree from "braintree";
import dotenv from "dotenv";
import orderModel from "../models/orderModel.js"

import logger from "../logger.js"

dotenv.config();

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
  try {
    //Taking all data from fields/files [since we have used formidable] (and not the body)
    const { name, description, price, category, quantity, shipping } = req.fields;
    const { photo } = req.files;

    //Validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "Photo is Required and should be less then 1mb" });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products,
    });
  } 
  catch (error) {
    logger.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating product!",
    });
  }
};

//get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category") // It will populate the category field with the actual category data
      .select("-photo") //Initially we don't want photo
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: "All Products received",
      products,
    });
  } 
  catch (error) {
    logger.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting products",
      error: error.message,
    });
  }
};

// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } 
  catch (error) {
    logger.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting single product!",
      error,
    });
  }
};

// get photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType); // It sets the header of the response with the content type
      return res.status(200).send(product.photo.data);
    }
  } 
  catch (error) {
    logger.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting photo!",
      error,
    });
  }
};

//delete controller
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } 
  catch (error) {
    logger.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

//upate products
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } = req.fields;
    const { photo } = req.files;
    //Validations
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "Photo is Required and should be less then 1mb" });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    });
  } 
  catch (error) {
    logger.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating product!",
    });
  }
};


//filters
export const productFiltersController = async (req, res) => {
  try {
    const { checkedArr, radio } = req.body;
    let args = {};
    if (checkedArr.length > 0) args.category = checkedArr;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

    const products = await productModel.find(args);

    if (products.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No product matches the filters.",
        products: [],
      });
    }

    res.status(200).send({
      success: true,
      products,
    });
  } 
  catch (error) {
    logger.log(error);
    res.status(400).send({
      success: false,
      message: "Error while filtering products!!",
      error,
    });
  }
};

// product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } 
  catch (error) {
    logger.log(error);
    res.status(400).send({
      message: "Error in product counting!!",
      error,
      success: false,
    });
  }
};

// product list based on page
export const productListController = async (req, res) => {
  try {
    const perPage = 3; //Sets the number of products displayed per page
    const page = req.params.page ? req.params.page : 1; //Reads the page number from the URL
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage) //EX: Page = 2 -> skip(3) (skips the first 3 products and fetches the next 3)
      .limit(perPage)
      .sort({ createdAt: -1 }); //Show the most recent products first

    res.status(200).send({
      success: true,
      products,
    });
  } 
  catch (error) {
    logger.log(error);
    res.status(400).send({
      success: false,
      message: "Error in getting products based on per page!!",
      error,
    });
  }
};

//Search based products
export const searchProductController = async (req, res) => {
  try {
    const {keyword} = req.params;
    const results = await productModel.find({
      $or: [ //Specifies that at least one of the following conditions must match
        {name: {$regex: keyword, $options: 'i'}}, // Searches for the keyword in the name field, ignoring case
        {description: {$regex: keyword, $options: 'i'}}, // Searches for the keyword in the description field, ignoring case
      ]
    })
    .select("-photo")
    .sort({createdAt: -1});

    res.status(200).send({
      success: true,
      message: "Searching successful!",
      results,
    })
  } 
  catch (error) {
    logger.log(error);
    res.status(400).send({
      success: false,
      message: "Error in searching products!!",
      error,
    })
  }
}

//Similar products
export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid }, // Excludes the product already displaying from similar products
      })
      .select("-photo")
      .limit(3)
      .populate("category");

    res.status(200).send({
      success: true,
      products,
    });
  } 
  catch (error) {
    logger.log(error);
    res.status(400).send({
      success: false,
      message: "Error while getting related products!",
      error,
    });
  }
};

// get products based on category
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");

    res.status(200).send({
      success: true,
      category,
      products,
    });
  } 
  catch (error) {
    logger.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error while getting products",
    });
  }
};


//payment gateway api
//token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        logger.log("Token error(From Backend): ", err);
        res.status(500).send(err);
      } 
      else {
        res.send(response);
      }
    });
  } 
  catch (error) {
    logger.log(error);
  }
};

//payment
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    
    if (!nonce || !cart || cart.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Invalid payment request",
      });
    }

    let total = 0;
    cart.map((i) => {
      total += i.price;
    });

    logger.log("Total Amount:", total); // Debugging
    logger.log("Nonce:", nonce); // Debugging
    
    let newTransaction = gateway.transaction.sale( // Initiates a new payment transaction with BrainTree
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true, //Directly submits the transaction for settlement
        },
      },
      function (error, result) {
        if (result) {
          // logger.log("Payment Result:", result);

          const order = new orderModel({ products: cart, payment: result, buyer: req.user._id, }).save();
          res.json({ ok: true });
        } 
        else {
          logger.error("Braintree Error:", error);
          res.status(500).send(error);
        }
      }
    );
  } 
  catch (error) {
    logger.log(error);
    res.status(500).send({
      success: false,
      message: "Error in processing payment",
      error,
    });
  }
};