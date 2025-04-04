import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshaccessToken,
  updateAccountDetails,
  updateUserAvatar,
  updateUsercoverImage,
  currentUser,
  changeCurrentUserPassword,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(
  upload.fields([
    // this is where we inject a middileware..
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// Secured Routes

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshtoken").post(refreshaccessToken);
router
  .route("/updatecoderimage")
  .patch(verifyJWT, upload.single("coverImage"), updateUsercoverImage);
router
  .route("/updateavatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/currentuser").get(verifyJWT, currentUser);
router.route("/changepassword").patch(verifyJWT, changeCurrentUserPassword);
router.route("/changeaccountdetails").patch(verifyJWT, updateAccountDetails);
router.route("/c/:userName").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);
// router.route("/changecurrentuser").post(verifyJWT, changeUser);

// accounts:
// email: one@gmail.com
// password: 1234

// email: three@gmail.com
// password: 12345

export default router;
