import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.modal.js"

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  //suppose you are a youtuber and you have to see whole stats of your channel like total subscribers, videos, views etc.
  const id = req.user
  if (!id) throw ApiError(401, "failed to get channel video . user is not looged in")
  const info = await User.aggregate([
    //as our youtuber is looged in we fetched his/her details through _id
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id)
      }
    },
    //to see total subscribers you can check fields in subscriptions where channel = my _id
    //we are matching our _id with channel field in subscriptions , in subscriptions we have channel field storing user id of channel owner
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    //we are looking for how much video do a youtuber published , just match our _id from owner in video document
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
        //this is sub-pipeline to find likes of video , in like model we have field called video containing video id 
        pipeline: [
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes"
            }
          },
          {
            $addFields: {
              likesCount: {
                $size: "$likes"
              }
            }
          },
          {
            $project: {
              _id: 1,
              views: 1,
              likesCount: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        //we have an array of documents holding subscriptions in which channel=our id means they are out subscribers,now we have to count that number . we have saved that field as subscribers and $size will give use that count
        subscribersCount: {
          $size: "$subscribers"
        },
        videosCount: {
          $size: "$videos"
        },
        //we have to calculate total views from video document->views ,this will go into videos document as add all views of videos
        totalViews: {
          $sum: "$videos.views"
        },
        totalLikes: {
          $sum: "$videos.likesCount"
        }
      }

    },
    {
      $project: {
        email: 1,
        videos: 1
      }
    }
  ])
  if (!info?.length) throw new ApiError(404, "Failed to get channel stats from db")
  res.status(200).json(new ApiResponse(200, info[0], "fetched channel stats successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const id = req.user
  if (!id) throw ApiError(401, "failed to get channel video . user is not looged in")
  const videos = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "video",
        pipeline: [
          {
            $project: {
              videoFile: 1,
              thumbnail: 1,
              owner: 1,
              title: 1,
              description: 1,
              views: 1,
              isPublished: 1
            }
          },
          //may get error due to wrong placement
          {
            $sort: {
              createdAt: -1
            }
          },
        ]
      }
    },
    
  ])
  if (!videos?.length) throw new ApiError(404, "Failed to get channel stats from db")
    res.status(200).json(new ApiResponse(200, videos[0].video, "fetched channel stats successfully"))
})

export {
  getChannelStats,
  getChannelVideos
}