import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.modal.js"
import { User } from "../models/user.modal.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body
  const userId = req.user?._id
  const userExits = await User.exists({ _id: userId })
  if (!userExits) throw new ApiError(400, "userId is required to tweet ,userId not provided or invalid")
  if (!content || content === "" || content.trim().length === 0) throw new ApiError(400, "tweet content is required to make a tweet ,tweet content empty or not defined")
  const makeTweet = await Tweet.create({
    content,
    owner: userId
  })
  if (!makeTweet) throw new ApiError(500, "problem while creating a tweet in server")
  return res.status(200).json(new ApiResponse(200, makeTweet, "tweet posted successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const userId = req.params.userId
  const userExits = await User.exists({ _id: userId })
  if (!userExits) throw new ApiError(400, "user id is required to get tweets..userId not found")
  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $unwind: "$ownerDetails"
    },
    //it may cause error as ownerDetails doesn't gives total tweets
    {
      $addFields: {
        totalTweets: {
          $literal: await Tweet.countDocuments({ owner: userId })
        }
      }
    }

  ])
  if (!tweets) throw new ApiError(500, "problem occured while fetching tweets of user")
  return res.status(200).json(new ApiResponse(200, tweets, "tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const userId = req.user?._id
  const { content } = req.body
  const tweetId = req.params.tweetId
  const [userExists, tweetExists] = await Promise.all([
    User.exists({ _id: userId }),
    Tweet.exists({ _id: tweetId })
  ])
  if (!userExists || !tweetExists) throw new ApiError(400, "user or tweet dons't exist .unable to update tweet")
  if (!content || content === "" || content.trim() === 0) throw new ApiError(400, "content must be provided and not empty.unable to update tweet")
  const updatedTweet = Tweet.findByIdAndUpdate(tweetId, { $set: { content: content } }, { new: true, runValidators: true })
  if (!updatedTweet) (500, "problem occured while updating tweet in server.")
  return res.status(200).json(new ApiResponse(200, updatedTweet, "tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const userId = req.user?._id
  const tweetId = req.params.tweetId
  const [userExists, tweetExists] = await Promise.all([
    User.exists({ _id: userId }),
    Tweet.exists({ _id: tweetId })
  ])
  if (!userExists || !tweetExists) throw new ApiError(400, "user or tweet dons't exist .unable to delete tweet")
  const deletedTweet = Tweet.findByIdAndDelete(tweetId, { new: true })
  if (!deletedTweet) (500, "problem occured while deleting tweet in server.")
  return res.status(200).json(new ApiResponse(200, deletedTweet, "tweet deleted successfully"))
})

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
}