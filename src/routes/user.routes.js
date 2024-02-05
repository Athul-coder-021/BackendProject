import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router()

// from app control came to here
router.route("/register").post(registerUser)
// router.route("/login").post(registerUser)

export default router