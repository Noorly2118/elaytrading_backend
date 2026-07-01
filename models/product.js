const mongoose = require('mongoose');

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

module.exports = mongoose.model('Product', productSchema);

