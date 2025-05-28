import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.modal.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, password, email, avatar, phone } = req.body
  console.log("email:" + email)
  if (
    [fullname, username, password, email].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!")
  }
  // with $or we can check for multiple condition of find
  const alreadyExists = User.findOne({
    $or: [{ username }, { email }]
  })
  if (alreadyExists) throw new ApiError(409, "User with same email or username already exists")


  //for files provided by multer
  //.fieles only comes after adding multer
  //if files exist -> check avatar[0] which provides a object ->  .path a variable in object to access path of image
  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0]?.path

  if (!avatarLocalPath) throw new ApiError(400, "Avatar is required")
  const avatarUploaded = await uploadOnCloudinary(avatarLocalPath)
console.log("response given by cloudinary after uploading image"+avatarUploaded)
  const coverImageUploaded = await uploadOnCloudinary(coverImageLocalPath)
  if (!avatarUploaded) throw new ApiError(400, "Avatar is required failed to upload on cloudinary")
  const user=await User.create({
fullname,
avatar:avatarUploaded.url,
coverImageUploaded:coverImageUploaded.url||"",
email,
password,
username:username.toLowerCase()
})

//to check if registered or not we can also check in db directly by an query to find record
const isUser=await User.findById(user._id)

//to select some fields we can use select() methord
//defaultly all fields are selected and we have to write which field not to select
isUser.select("-password -refreshToken")

if(!isUser)return ApiError(500,"User not registered problem in insertion in db")
return res.status(201).json(
  new ApiResponse(200,isUser,"User registered successfully")
)
})
export { registerUser }