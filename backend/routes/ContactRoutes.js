import { Router } from "express";
import {
  getAllContacts,
  searchContacts,
  getContactsForList,
} from "../controllers/ContactController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const contactsRoutes = Router();

contactsRoutes.post("/search", verifyToken, searchContacts);
contactsRoutes.get("/all-contacts", verifyToken, getAllContacts);
contactsRoutes.get("/get-contacts-for-list", verifyToken, getContactsForList);

export default contactsRoutes;
