import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.modal.js"
import ApiError from "../utils/ApiError.js"
import  ApiResponse  from "../utils/ApiResponse.js"
import  asyncHandler  from "../utils/asyncHandler.js"
import {Subscription} from "../models/subscription.modal.js"

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params
  const userId = req.user?._id
  // TODO: toggle subscription
  //just check for if this record exists and if not make internal
  if (!channelId || !userId) throw new ApiError(400, "channelId and userId is required to toggle subscription")
  const [channelExists, userExists] = await Promise.all([
    User.exists({ _id: channelId }),
    User.exists({ _id: userId })
  ])
  if (!channelExists) throw new ApiError(404, "no channel exists against sended id")
  if (!userExists) throw new ApiError(404, "no user exists against sended id")
  const isSubscribed = await Subscription.findOne({ subscriber: userId, channel: channelId })
  if (!isSubscribed) {
    const subscribe = await Subscription.create({
      subscriber: userId,
      channel: channelId
    })
   return res.status(200).json(new ApiResponse(200, subscribe, "subscribed to channel successfully"))
  }
  else {
    const unsubscribe = await Subscription.deleteOne({ _id: isSubscribed._id })
   return res.status(200).json(new ApiResponse(200, unsubscribe, "unsubscribed to channel successfully"))
  }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params
  if (!channelId) throw new ApiError(401, "channel id is required to get subscribers")
  const [channelExists] = await Promise.all([
    User.exists({ _id: channelId })
  ])
  if (!channelExists) throw new ApiError(401, "no channel exists against provided channel id")
    const subscribers = Subscription.aggregate([
  {
    $match: {
      channel: new mongoose.Types.ObjectId(channelId)
    }
  },
  {
    $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1
            }
          }
        ]
      }
    },
    {
      $project:{
        channel:1,
        subscriberDetails:1
      }
    },
    {
      $unwind:"$subscriberDetails"
    }
  ])
  if(!subscribers)throw new ApiError(404,"failed to fetch subscribers of channel")
    return res.status(200).json(new ApiResponse(200,subscribers,"fetch subscribers successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params
  if (!subscriberId) throw new ApiError(401, "subscriber id is required to get subscribers")
  const [userExists] = await Promise.all([
    User.exists({ _id: subscriberId })
  ])
  if (!userExists) throw new ApiError(401, "no channel exists against provided channel id")
    const subscribedChannels=await Subscription.aggregate([
  {
    $match:{
      subscriber:new mongoose.Types.ObjectId(subscriberId)
    }
  },
  {
    $lookup:{
      from:"users",
      localField:"channel",
      foreignField:"_id",
      as:"channelDetails",
      pipeline:[
        {
          $project:{
            fullname:1,
            username:1,
            avatar:1,
            coverImage:1
          }
        }
      ]
    }
  },
  {
    $project:{
      channel:1,
      channelDetails:1
    }
  },
  {
    $unwind:"$channelDetails"
  }
])
if(!subscribedChannels)throw new ApiError(404,"failed to fetch subscribed channels")
  return res.status(200).json(new ApiResponse(200,subscribedChannels,"fetched subscribed channels successfully"))
})

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
}