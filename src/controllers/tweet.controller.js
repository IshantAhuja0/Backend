import mongoose from "mongoose";
import { Tweet } from "../models/tweet.modal.js";
import { User } from "../models/user.modal.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user?._id;

  const userExists = await User.exists({ _id: userId });
  if (!userExists) throw new ApiError(400, "User not found or invalid userId");

  if (!content || content.trim().length === 0)
    throw new ApiError(400, "Tweet content is required and cannot be empty");

  const makeTweet = await Tweet.create({
    content,
    owner: userId,
  });

  if (!makeTweet) throw new ApiError(500, "Failed to create tweet");

  return res.status(201).json(new ApiResponse(201, makeTweet, "Tweet posted successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const userExists = await User.exists({ _id: userId });
  if (!userExists) throw new ApiError(400, "User not found with provided userId");

  const totalTweetsCount = await Tweet.countDocuments({ owner: userId });

  const tweets = await Tweet.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [{ $project: { fullname: 1, username: 1, avatar: 1 } }],
      },
    },
    { $unwind: "$ownerDetails" },
    {
      $addFields: {
        totalTweets: totalTweetsCount,
      },
    },
  ]);

  if (!tweets) throw new ApiError(500, "Failed to fetch tweets");

  return res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { content } = req.body;
  const tweetId = req.params.tweetId;

  const [userExists, tweetExists] = await Promise.all([
    User.exists({ _id: userId }),
    Tweet.exists({ _id: tweetId }),
  ]);
  if (!userExists || !tweetExists)
    throw new ApiError(400, "User or tweet doesn't exist");

  if (!content || content.trim().length === 0)
    throw new ApiError(400, "Content must be provided and not empty");

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { $set: { content } },
    { new: true, runValidators: true }
  );

  if (!updatedTweet)
    throw new ApiError(500, "Failed to update tweet");

  return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const tweetId = req.params.tweetId;

  const [userExists, tweetExists] = await Promise.all([
    User.exists({ _id: userId }),
    Tweet.exists({ _id: tweetId }),
  ]);
  if (!userExists || !tweetExists)
    throw new ApiError(400, "User or tweet doesn't exist");

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletedTweet)
    throw new ApiError(500, "Failed to delete tweet");

  return res.status(200).json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"));
});

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
};
