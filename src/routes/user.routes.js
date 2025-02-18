import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshaccessToken,
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

export default router;
