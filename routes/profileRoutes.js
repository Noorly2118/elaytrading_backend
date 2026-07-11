import express from "express";

import {
    getProfile,
    updateProfile,
    changePassword,
} from "../controllers/profileController.js";

import { protectUser } from "../middleware/protectUser.js";

const router = express.Router();

router.get("/", protectUser, getProfile);

router.put("/", protectUser, updateProfile);

router.put("/change-password", protectUser, changePassword);

export default router;
