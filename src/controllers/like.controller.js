import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.modal.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Video } from "../models/video.modal.js"
import { User } from "../models/user.modal.js"
import { Comment } from "../models/comment.modal.js"
import { Tweet } from "../models/tweet.modal.js"
const toggleVideoLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on video
  //for toggle like first we have to check if its previously liked or not 
  //first find like document against provided videoId ,if its found that means video is likes so delete that documnent and vica versa
  //we also need user whome is performing like operation
  const { videoId } = req.params
  const userId = req.user?._id
  if (!videoId || !userId) throw new ApiError(400, "video id and user id is required to perform like operation")
  const [videoExists, userExists] = await Promise.all([
    Video.exists({ _id: videoId }),
    User.exists({ _id: userId }),
  ]);
  //
  if (!videoExists) throw new ApiError(404, "Video not found.");
  if (!userExists) throw new ApiError(404, "User not found.");
  const isLiked = await Like.findOne({ video: videoId, likedBy: userId })
  //means no document exist and video is not liked by current user
  if (!isLiked) {
    const likeVideo = await Like.create({
      video: videoId,
      likedBy: userId
    })
    res.status(200).json(new ApiResponse(200, likeVideo, "like toggle operation performed .video liked successfully"))
  }
  else {
    const deleteLike = await Like.deleteOne({ _id: isLiked._id })
    res.status(200).json(new ApiResponse(200, deleteLike, "like toggle operation performed. video unliked successfully"))
  }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  //TODO: toggle like on comment
  const userId = req.user?._id
  if (!commentId || !userId) throw new ApiError(400, "comment id and user id is required to perform like operation")
  const [commentExists, userExists] = await Promise.all([
    Comment.exists({ _id: commentId }),
    User.exists({ _id: userId }),
  ]);
  //
  if (!commentExists) throw new ApiError(404, "Comment not found.");
  if (!userExists) throw new ApiError(404, "User not found.");
  const isLiked = await Like.findOne({ comment: commentId, likedBy: userId })
  //means no document exist and video is not liked by current user
  if (!isLiked) {
    const likeComment = await Like.create({
      comment: commentId,
      likedBy: userId
    })
    res.status(200).json(new ApiResponse(200, likeComment, "like toggle operation performed .comment liked successfully"))
  }
  else {
    const deleteLike = await Like.deleteOne({ _id: isLiked._id })
    res.status(200).json(new ApiResponse(200, deleteLike, "like toggle operation performed. comment unliked successfully"))
  }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params
  //TODO: toggle like on tweet
  const userId = req.user?._id
  if (!tweetId || !userId) throw new ApiError(400, "tweet id and user id is required to perform like operation")
  const [tweetExists, userExists] = await Promise.all([
    Tweet.exists({ _id: tweetId }),
    User.exists({ _id: userId }),
  ]);
  //
  if (!tweetExists) throw new ApiError(404, "Tweet not found.");
  if (!userExists) throw new ApiError(404, "User not found.");
  const isLiked = await Like.findOne({ comment: tweetId, likedBy: userId })
  //means no document exist and video is not liked by current user
  if (!isLiked) {
    const likeTweet = await Like.create({
      tweet: tweetId,
      likedBy: userId
    })
    res.status(200).json(new ApiResponse(200, likeTweet, "like toggle operation performed .tweet liked successfully"))
  }
  else {
    const deleteLike = await Like.deleteOne({ _id: isLiked._id })
    res.status(200).json(new ApiResponse(200, deleteLike, "like toggle operation performed. tweet unliked successfully"))
  }

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user?._id
  if (!userId) throw new ApiError(400, "login first to see liked videos . no userId found")
  //we have go throught different documents and tables so using aggregation would be good
  const likedVideos =await Like.aggregate([
    //match userId first
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId)
      }
    },
    //lookup to get all videos with likedBy = userid
    {
            $lookup: {
              from: "videos",
              localField: "video",
              foreignField: "_id",
              as: "videoDetails",
              pipeline: [
                //we are showing all videos without checking published status maybe its private now
                {
                  $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"ownerDetails",
                    pipeline:[
                      {
                        $project:{
                          fullname:1,
                          username:1,
                          email:1
                        }
                      }
                    ]
                  }
                },
                {
                  $project: {
                    videoFile: 1,
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    views: 1,
                    ownerDetails:1
                  }
                },
                {
                  $unwind:"$ownerDetails"
                }
              ]
            }
          },
          //flatten array as a single object
          {
            $unwind:"$videoDetails"
          },

  ])
if(!likedVideos || likedVideos.length===0)throw new ApiError(404,"problem occurred while fetching all liked videos")
  res.status(200).json(new ApiResponse(200,likedVideos,"fetched all liked videos successfully"))
//also a good way avoiding nested pipelines
  // const likedVideo=await Like.aggregate([
  //   {
  //     $match:{
  //       likedBy:new mongoose.Types.ObjectId(userId)
  //     }
  //   },
  //   {
  //     $lookup:{
  //       from:"videos",
  //       localField:"likedBy",
  //       foreignField:"_id",
  //       as:"videoDetails"
  //     }
  //   },
  //   {
  //     $unwind:"$videoDetails"
  //   },
  //   {
  //     $lookup:{
  //       from:"users",
  //       localField:"$videoDetails.owner",
  //       foreignField:"_id",
  //       as:"ownerDetails"
  //     }
  //   },
  //   {
  //     $unwind:"$ownerDetails"
  //   },
  //   {
  //     $project: {
  //       _id: 0,
  //       videoId: "$videoDetails._id",
  //       title: "$videoDetails.title",
  //       description: "$videoDetails.description",
  //       thumbnail: "$videoDetails.thumbnail",
  //       videoFile: "$videoDetails.videoFile",
  //       duration: "$videoDetails.duration",
  //       views: "$videoDetails.views",
  //         ownerId: "$ownerDetails._id",
  //         ownerUsername: "$ownerDetails.username"
  //     }
  //   }
  // ])
})

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos
}