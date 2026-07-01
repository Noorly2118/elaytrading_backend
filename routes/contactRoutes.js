import express from "express";
import {  createContact, getContacts, markAsRead, deleteContact, } from "../controllers/contactController.js";
import { protectAdmin } from "../middleware/protectAdmin.js";


const router = express.Router();

router.post("/", createContact);

router.get( "/", protectAdmin, getContacts
);

router.patch( "/:id/read", protectAdmin, markAsRead
);

router.delete( "/:id", protectAdmin, deleteContact
);

export default router;