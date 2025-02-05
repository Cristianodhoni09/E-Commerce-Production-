import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [ //products will be an array of objects
      {
        type: mongoose.ObjectId, // It refers to the unique identifier of documents in the 'Products' collection
        ref: "Products", // It creates relationship b/w this order collection and products collection
      },
    ],
    payment: {}, //It will store payment details
    buyer: {
      type: mongoose.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      default: "Not Processed", //default status if not provided
      enum: ["Not Processed", "Processing", "Shipped", "delivered", "cancelled"], // allowed values for the status field to ensure data integrity
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);