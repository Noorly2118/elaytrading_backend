import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationExpires: { type: Date },
    phone: {
    type: String,
    default: "",
},

shippingAddress: {
    country: {
        type: String,
        default: "Ethiopia",
    },
    city: {
        type: String,
        default: "",
    },
    region: {
        type: String,
        default: "",
    },
    address: {
        type: String,
        default: "",
    },
},
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model("User", userSchema);