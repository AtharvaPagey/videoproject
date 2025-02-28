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
router.route("/updatecoderimage").post(
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  updateUsercoverImage
);
router.route("/updateavatar").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  updateUserAvatar
);
router.route("/currentuser").post(currentUser);
router.route("/changepassword").post(verifyJWT, changeCurrentUserPassword);
router.route("/changeaccountdetails").post(verifyJWT, updateAccountDetails);
// router.route("/changecurrentuser").post(verifyJWT, changeUser);

// accounts:
// email: one@gmail.com
// password: 1234

// email: three@gmail.com
// password: 12345

export default router;
