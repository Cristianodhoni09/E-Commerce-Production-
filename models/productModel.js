import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.ObjectId, //getting the id of category created, it is a foreign key to establish the relationship between product and category collections
      ref: "Category", //Name we have kept in catogery schema
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    photo: {
      data: Buffer, //Photo from mongodb, not from cloudinary/AWS S3 -> Stores the binary data of the image
      contentType: String, // Specifies the type of image file (e.g., JPEG, PNG)
    },
    shipping: {
      type: Boolean, //To show order status
    },
  },
  { timestamps: true }
);

export default mongoose.model("Products", productSchema);