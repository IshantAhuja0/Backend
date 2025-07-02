import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.modal.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";

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
    avatar: {
      url: avatarUploaded.url,
      public_id: avatarUploaded.public_id,
    },
    coverImage: {
      url: coverImageUploaded.url || "",
      public_id: coverImageUploaded.public_id || "",
    },
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
    new ApiResponse(200, {isUser,avatarUploaded}, "User registered successfully")
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
    if (!email && !username) throw new ApiError(400, "email is required but not provided in user.controller.js")

    //if this username or email exist in db it will return .$or checks for more than one field in one query
    const user = await User.findOne({
      $or: [{ username }, { email }]
    })
    //problem can occur as we returned rather than throw this error . video 16 backend series
    if (!user) throw new ApiError(401, "user not exist against provided email or username")
    //now we have to check for password ,we have defined a method in user.modal.js for this but its not part of mongoose model so we can't access it by User as its not part of mongoose.

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

})
const logoutUser = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }).select("-watchHistory -password -avatar -coverImage -createdAt -updatedAt -refreshToken -__v")
  const options = {
    httpOnly: true,
    secure: true
  }
  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, { updatedUser }, "User logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
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
})
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const userFromMiddleware = req.user?._id
    const user = await User.findById(userFromMiddleware)
    const isCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isCorrect) throw new ApiError(401, "Invalid currect password")
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(new ApiResponse(200, {}, "password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
  const currentUser = req.user
  if (!currentUser) throw new ApiError(401, "no user is logged in ")
  return res.status(200).json(new ApiResponse(200, { user: currentUser }, "current user fetched successfully"))
})
const updateAccountDetails = asyncHandler(async (req, res) => {
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
})
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
      throw new ApiError(401, "Avatar not found! in updateUserAvatar user.controller.js");
    }

    // Upload new avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.url) {
      throw new ApiError(401, "Error while uploading avatar in updateUserAvatar user.controller.js");
    }

    const userId = req.user?._id;
    const oldUser = await User.findById(userId);

    // Store old public_id before updating
    const oldPublicId = oldUser?.avatar?.public_id;

    // Update user with new avatar
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          avatar: {
            url: avatar.url,
            public_id: avatar.public_id,
          },
        },
      },
      { new: true }
    ).select("-password");

    // Delete the old image from Cloudinary if it exists
    if (oldPublicId) {
      const deleteResult = await deleteFromCloudinary(oldPublicId,'image');
      if (!deleteResult || deleteResult.result !== "ok") {
        console.warn("⚠️ Failed to delete old image from Cloudinary");
      }
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { user: updatedUser }, "Avatar updated successfully"));

})
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
      throw new ApiError(401, "coverImage not found! in updateUserCoverImage user.controller.js");
    }

    // Upload new avatar to Cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage?.url) {
      throw new ApiError(401, "Error while uploading coverImage in updateUserCoverImage user.controller.js");
    }

    const userId = req.user?._id;
    const oldUser = await User.findById(userId);

    // Store old public_id before updating
    const oldPublicId = oldUser?.avatar?.public_id;

    // Update user with new avatar
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          coverImage: {
            url: coverImage.url,
            public_id: coverImage.public_id,
          },
        },
      },
      { new: true }
    ).select("-password");

    // Delete the old image from Cloudinary if it exists
    if (oldPublicId) {
      const deleteResult = await deleteFromCloudinary(oldPublicId,'image');
      if (!deleteResult || deleteResult.result !== "ok") {
        console.warn("⚠️ Failed to delete old image from Cloudinary");
      }
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { user: updatedUser }, "Cover Image updated successfully"));

})

//aggeration pipeline is used here
//through this function the user is getting information about a specific channel like freecodecamp has subscribers... 
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params
  //each object in User.aggregate represent a stage of aggeration
  console.log(username)
  if (!username?.trim()) throw new ApiError(401, "username is missing")
  // this counts no. of subscribers of a user 
  const channel = await User.aggregate([
    //in first stage we are finding record based on username as we normally do it with collection.find() or User.find()
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    //in second stage we are looking for a specific field in a table in order to replace it with a document. like if we have a document book storing auther_id , we have to replace auther_id with actual detail stored in other document
    //we written  that in our record we have a field named _id  replace that(means gives data against it) with field named channel lies in subscriptions document and store it as subscribers
    {
      //in subscriptionSchema channel is an id containing id of user which owns a channel and in our record its out id. so basically we are matching our _id with channel_id in subscriptionSchema the count of this will be our subscribers
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    //in this lookup we are finding if a record in subscriptionSchema has subscriber=_id(our id ) it means we have subscribed to that channel and the count result from this lookup gives no. of channels to which we subscribed.
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo"
        },
        //this checks if me as a user has subscribed to the channel for which am looking for.
        isSubscribedTo: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          }
        }
      }
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribedTo: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      }
    }
  ])
  if (!channel?.length) {
    throw new ApiError(404, "channel doesn't exist")
  }
  return res.status(200)
    .json(new ApiResponse(200, channel[0], "user channel found successfully"))
})

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id)
      }
    },
    //in this stage we are looking for fetching object of videos against ids provided in watchHistory array to get info of our watch history.
    // in lookup localField if we pass an array aggregation dont't treat it as a single entity rather it would match its all items in collection,like if we pass an array of ids it would lookup for each id and results accordingly
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        //we are writing a subpipeline , we got video object of watch history now we need to get owner details from that object
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              //now for we got owner object of video but now we should also dug deep to get only necessary info. of owner thorough a sub-pipeline
              pipeline: [
                //project is used to pick specific fields form a record or object
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1
                  }
                },
                //as we have data in form of array and we have to access first item of it , for simplicity in frontend we make this structure simple to return just an array.
                {
                  //this will over-write owner object and assing it first item of owner as written
                  $addFields: {
                    owner: {
                      $first: "$owner"
                    }
                  }
                }
              ]
            }
          }

        ]
      },
    },
  ])
  if (!user) throw new ApiError(404, "failed to find watch history of user")
  res.status(200).json(new ApiResponse(200, user[0].watchHistory, "watch history fetched successfully"))
})
export { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, changeCurrentPassword, updateUserAvatar, updateAccountDetails, updateUserCoverImage, getUserChannelProfile, getWatchHistory }