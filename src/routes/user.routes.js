import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middleswares/multer.middleware.js"

const router = Router()

// from app control came to here
router.route("/register").post(
    //injecting  middleware before calling registerUser
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
    )
// router.route("/login").post(registerUser)

export default router