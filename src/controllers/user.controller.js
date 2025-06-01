import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.modal.js";
import uploadOnCloudinary from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import ApiResponse from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (user) => {
  //generateRefreshToken and generateAccessToken these methods are same as previus written in modals can be accessed through user object.
  const accessToken = await user.generateAccessToken()
  const refreshToken = await user.generateRefreshToken()
  if (!accessToken || !refreshToken) throw new ApiError(500, "problem while generating access or refresh tokens")
  //save refresh token in db and return these tokens to user
  //so we have to add refresh token in user object as its the instance of our user 
  user.refreshToken = refreshToken
  //to save this refreshToken (its kind of similar to update your record in db and adding a field like refreshToken in our case)
  //as this is a db operation its checks for all required fiels as any other request to db and since we are just trying to add a token we can turn off these validation with validateBeforeSave:false.
  await user.save({ validateBeforeSave: false })
  return { accessToken, refreshToken }
}

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
  const avatarLocalPath = req.files?.avatar?.[0].path
  const coverImageLocalPath = req.files?.coverImage?.[0].path
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

const loginUser = asyncHandler(async (req, res) => {
  /*
  take email and password from req.body
  check if exist and if not send error ApiResponse , also check if its not empty
  match credential and send response if email or password not match with db
  generate token and send to in response 
  
  */
  const { email, username, password } = req.body
  try {
    if (!email && !username) throw new ApiError(400, "email is required but not provided in user.controller.js")

    //if this username or email exist in db it will return .$or checks for more than one field in one query
    const user = await User.findOne({
      $or: [{ username }, { email }]
    })
    //problem can occur as we returned rather than throw this error . video 16 backend series
    if (!user) throw new ApiError(401, "user not exist against provided email or username")
    //now we have to check for password ,we have defined a methord in user.modal.js for this but its not part of mongoose model so we can't access it by User as its part of mongoose.
    // isPasswordCorrect is defined in modal and can be accessed by our return result or record of data , we have user(got after checking for email) which provides this methord.
    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if (!isPasswordCorrect) throw new ApiError(401, "provided password doesn't match . Try again ")

    //function written above for generation of access and refresh token 
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user)

    //for sending data or response to user in cookies either we can update and send our user object or we make a db call to get our user and in this request use .select() to remove the fields like password and photo which are not good to send in response 

    const loggedInDetail = {
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      refreshToken: user.refreshToken,
    }
    //in case first makes problem we can use this query
    // or loggedInDetail=User.findOne(user._id).select("-password -avatar -coverImage -watchHistory")

    //this is for sending data through cookies to user in response.
    const options = {
      //through these our cookies are only modifiable through backend and can only be accessed not modified in frontend
      httpOnly: true,
      secure: true
    }
    return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, {
        user: loggedInDetail, accessToken, refreshToken
      }, "User logged in successfully"))

  } catch (error) {
    throw new ApiError(500, "Internal server occured while loggin in user in user.controller.js" + error)
  }
})
const logoutUser = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } })
  const options = {
    httpOnly: true,
    secure: true
  }
  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request")

    //while generating refresh token we have given _id in payload so we can access that same id after decoding token
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)
    if (!user) throw new ApiError(401, "invalid refresh token ")
    if (user?.refreshToken !== incomingRefreshToken) throw new ApiError(401, "Refresh token expired or not valid")

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user)
    const options = {
      httpOnly: true,
      secure: true
    }
    return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, {
        user: loggedInDetail, accessToken, refreshToken
      }, "Access token refreshed"))
  } catch (error) {
    throw new ApiError(500, "Internal server error occured while refreshing access token in user.controller.js " + error)
    
  }
})
const changeCurrentPassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    const userFromMiddleware = req.user?._id
    const user = await User.findById(userFromMiddleware)
    const isCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isCorrect) throw new ApiError(401, "Invalid currect password")
      user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(new ApiResponse(200, {}, "password changed successfully"))
  } catch (error) {
    
    throw new ApiError(500, "Internal server error occured while changing password user.controller.js " + error)
  }
})

const getCurrentUser = asyncHandler(async (req, res) => {
  const currentUser = req.user
  if (!currentUser) throw new ApiError(401, "no user is logged in ")
    return res.status(200).json(new ApiResponse(200, { user: currentUser }, "current user fetched successfully"))
})
const updateAccountDetails = asyncHandler(async (req, res) => {
  try {
    const { fullname, email } = req.body
    if (!fullname || !email) throw new ApiError(4011, "fullname and email not provided . necessary for update")
      const user = req.user
    const result = await User.findByIdAndUpdate(user._id,
      {
        $set: {
          fullname,
          email
        }
      },
      //this parameter return the updated record by itself
      { new: true }
    ).select("-password")
    return res.status(200).json(new ApiResponse(200, { user }, "account details updated successfully"))
  } catch (error) {
  throw new ApiError(500, "Internal server error occured while updating user account details user.controller.js " + error)
  
}
})
const updateUserAvatar = asyncHandler(async (req, res) => {
try {
    const avaterLocalPath = req.file?.path
    if (!avaterLocalPath) throw new ApiError(401, "avatar not found! in updateUserAvatart user.controller.js")
      const avatar = await uploadOnCloudinary(avaterLocalPath)
    if (!avatar.url) throw new ApiError(401, "error while uploading avatar in updateUserAvatart user.controller.js")
      const userId = req.user?._id
    const user = await User.findByIdAndUpdate(userId,
      {
        $set: {
          avatar: avatar.url
        }
      },
      {
        new: true
      }
    ).select("-password")
    return res.status(200).json(new ApiResponse(200,{user},"update avatar successfully"))
} catch (error) {
  
  throw new ApiError(500, "Internal server error occured while updating avatar user.controller.js " + error)
}
})
const updateUserCoverImageAvatar = asyncHandler(async (req, res) => {
try {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) throw new ApiError(401, "coverImage not found! in updateUserCoverImage user.controller.js")
      const coverImage = await uploadOnCloudinary(avaterLocalPath)
    if (!coverImage.url) throw new ApiError(401, "error while uploading coverImage in updateUserCoverImage user.controller.js")
      const userId = req.user?._id
    const user = await User.findByIdAndUpdate(userId,
      {
        $set: {
          coverImage: coverImage.url
        }
      },
      {
        new: true
      }
    ).select("-password")
    return res.status(200).json(new ApiResponse(200,{user},"update cover image successfully"))
} catch (error) {
  
  throw new ApiError(500, "Internal server error occured while updating cover image user.controller.js " + error)
}
})
export { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, changeCurrentPassword, updateUserAvatar, updateAccountDetails, updateUserCoverImageAvatar }