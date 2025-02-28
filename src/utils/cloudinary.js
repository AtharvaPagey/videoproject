import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { console } from "inspector";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadonCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) {
      console.log("File Path not found!!");
      return null;
    }
    //uploading file on Cloudinary
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto", // this will upload every thing...be it img or video etc
    });
    // File has been sucessfully uploaded..
    fs.unlinkSync(localfilepath);
    return response;
  } catch (error) {
    fs.unlinkSync(localfilepath); // removes the locally saved temporary file because the upload was failed
    return null;
  }
};

export { uploadonCloudinary, cloudinary };
