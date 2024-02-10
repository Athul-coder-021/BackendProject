import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, logOutUser, loginUser, refreshAccessToken, registerUser,updateAccountDetails, updateUserAvatar, updateUserCoverImgae } from "../controllers/user.controller.js";
import {upload} from "../middleswares/multer.middleware.js"
import { verifyJWT } from "../middleswares/auth.middleware.js";

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
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post( verifyJWT,logOutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/update-account").patch(verifyJWT,updateAccountDetails)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImgae)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("history").get(verifyJWT,getWatchHistory)



export default router