import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
import fs from 'fs';

dotenv.config();

// Log env to check if loaded correctly

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      return null;
    }


    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder: "test_uploads"
    });

    fs.unlinkSync(filePath)
    return result;

  } catch (error) {
    fs.unlinkSync(filePath); // remove temporary file
    return null;
  }
};

export default uploadOnCloudinary;
