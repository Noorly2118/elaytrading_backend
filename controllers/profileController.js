import User from "../models/User.js";
import Order from "../models/order.js";
import bcrypt from "bcryptjs";

// =========================================
// GET PROFILE
// =========================================

export const getProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user._id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            user,
            orders,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

// =========================================
// UPDATE PROFILE
// =========================================

export const updateProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.phone = req.body.phone || user.phone;

        user.shippingAddress = {
            country:
                req.body.shippingAddress?.country ||
                user.shippingAddress.country,

            city:
                req.body.shippingAddress?.city ||
                user.shippingAddress.city,

            region:
                req.body.shippingAddress?.region ||
                user.shippingAddress.region,

            address:
                req.body.shippingAddress?.address ||
                user.shippingAddress.address,
        };

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};

// =========================================
// CHANGE PASSWORD
// =========================================

export const changePassword = async (req, res) => {

    try {

        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Current password is incorrect",
            });
        }

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(
            newPassword,
            salt
        );

        await user.save();

        res.json({
            message: "Password changed successfully",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};