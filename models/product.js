import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
 category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Category",
  required: true,
},
  description: { type: String,required:true },
  price: { type: Number, required: true },
  image: { type: String },
  stock: { type: Number},
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Product", productSchema);
