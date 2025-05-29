import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.modal.js";
import uploadOnCloudinary from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  //avatar comes from multer and hence we can not get or from req.body
  console.log(req.body)
  const { fullname, username, password, email } = req.body
  // console.log("request from postman : "+req.body)
  if (
    [fullname, username, password, email].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!")
  }
  // with $or we can check for multiple condition in find methord
  const alreadyExists = await User.findOne({
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

  const coverImageUploaded = await uploadOnCloudinary(coverImageLocalPath)
  if (!avatarUploaded) {
    throw new ApiError(400, "Avatar is required failed to upload on cloudinary")
  }
  const user = await User.create({
    fullname,
    avatar: avatarUploaded.url,
    coverImage: coverImageUploaded.url || "",
    email,
    password,
    username: username.toLowerCase()
  })
  //to check if registered or not we can also check in db directly by an query to find record

  //to select some fields we can use select() methord
  //defaultly all fields are selected and we have to write which field not to select
  const isUser = await User.findById(user._id).select("-password -refreshToken")

  if (!isUser) return ApiError(500, "User not registered problem in insertion in db")
  return res.status(201).json(
    new ApiResponse(200, isUser, "User registered successfully")
  )
})
export { registerUser }