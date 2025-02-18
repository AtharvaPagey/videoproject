import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // save func saves the data changes done but requires all the fields....to avoid this we use validateBeforeSave parameter
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // Algorithm:

  // get user details
  // validate if details are correct: check for email and username
  // check if user already exists: using username n email
  // get an image and an avatar for the user
  // upload the details to cloudnary: check if avatar n image is uploaded
  // create a user object in db...as db needs an obj for working
  // check if user obj was created
  // remove confidential details like refresh token n passwd from the darabase
  // return the response to the user

  const { id, email, fullName, userName, password } = req.body;
  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ userName }, { email }] }); // dollar operator...the find one with $or returns the first document containing userName or email
  if (existedUser) {
    throw new ApiError(409, "User with username or email Already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadonCloudinary(avatarLocalPath);
  const coverImage = await uploadonCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // ALGORITHM:
  // get data from req->body
  // get details of the user: userName or email and password
  // check if userName or email and password follow rules (if any)
  // validate the userName and password from db
  // if does not exist then redirect to register page
  // check for any refreshToken on the user
  // grant refreshToken and accessToken
  // send cookie

  const { userName, email, password } = req.body;
  if (!userName && !email)
    throw new ApiError(400, "username or email is required");

  const user = await User.findOne({ $or: [{ email }, { userName }] });

  if (!user) throw new ApiError(404, "User does not exist");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (isPasswordValid) throw new ApiError(401, "Invalid user credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedinUser = User.findById(user._id).select(
    "-password -refreshToken"
  );

  // normally cookies are modifiable from front end
  // but opting these options we make the cokies modifiable only by the server
  const options = {
    httpOnly: true,
    secure: true,
  };

  console.log(loggedinUser);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedinUser.o,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        "User Looged In Succefully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  ); // This finds and updates the user._id

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

const refreshaccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newrefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newrefreshToken },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

export { registerUser, loginUser, logoutUser, refreshaccessToken };

// .some method: Determines whether the specified callback function returns true for any element of an array.
