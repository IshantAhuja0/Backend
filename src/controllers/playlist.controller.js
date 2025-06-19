import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.modal.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { User } from "../models/user.modal.js"
import { Video } from "../models/video.modal.js"


const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body
  const owner = req.user?._id
  //TODO: create playlist
  if (!name || !owner) throw new ApiError(400, "name and logged in user is required to create playlist")
  if (name === "" || name.trim().length === 0) throw new ApiError(400, "name is empty invalid for making playlist")
  const userExists = User.exists({ _id: owner })
  if (!userExists) throw new ApiError(404, "invalid user credentials")
  //also check if same user have created for playlist with same name earlier
  const playlistAlreadyExists = await Playlist.findOne({ owner: owner, name: name })
  if (playlistAlreadyExists) throw new ApiError(409, "playlist with same name already exists.rename it with a different name")
  const createPlaylist = await Playlist.create({
    name,
    description,
    owner,
  })
  if (!createPlaylist) throw new ApiError(500, "problem occured while creating a playlist")
  return res.status(200).json(new ApiResponse(200, createPlaylist, "playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params
  //TODO: get user playlists
  const userExists = User.exists({ _id: userId })
  if (!userExists) throw new ApiError(400, "user details not provided or user not exists")
  const playlists = Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "userDetails",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              createdAt: 1
            }
          }
        ]
      }
    },
    //through this in every record the userDetais array get flatten 
    {
      $unwind: "$userDetails"
    },
    {
      $addFields: {
        totalVideos: {
          //size expects an array so give not number so vidoes.length will not be valid
          $size: "$videos"
        }
      }
    }
  ])
  if (!playlists) throw new ApiError(500, "problem occured while fetching playlists")
  return new ApiResponse.status(200).json(new ApiResponse(200, playlists, "fetched playlists successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  //TODO: get playlist by id
  const playlistExists = await Playlist.exists({ _id: playlistId })
  if (!playlistExists) throw new ApiError(400, "playlist id not provided or invalid")
  const playlist = await Playlist.findById(playlistId)
  if (!playlist) throw new ApiError(500, "problem occured while fetching a playlist by id")
  return res.status(200).json(new ApiResponse(200, playlist, "fetched playlist successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params
  const [playlistExists, videoExists] = await Promise.all([
    Playlist.exists({ _id: playlistId }),
    Video.exists({ _id: videoId })
  ])
  if (!playlistExists || !videoExists) throw new ApiError(400, "video id and playlist id are required to add video to playlist . not provided or invalid")
  const videoAdded = await Playlist.findByIdAndUpdate(playlistId, { $addToSet: { videos: videoId } }, { new: true, runValidators: true })
if (!videoAdded) throw new ApiError(500, "problem occured while adding video in playlist")
  return res.status(200).json(new ApiResponse(200, videoAdded, "added video to playlist successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params
  // TODO: remove video from playlist
  const [playlistExists, videoExists] = await Promise.all([
    Playlist.exists({ _id: playlistId }),
    Video.exists({ _id: videoId })  
  ])
  if (!playlistExists || !videoExists) throw new ApiError(400, "video id and playlist id are required to remove video from playlist . not provided or invalid")
  // const videoDeleted = await Playlist.updateOne({_id:playlistId}, { $pull: { videos: videoId } }, { new: true })
  const videoDeleted = await Playlist.findByIdAndUpdate(playlistId, { $pull: { videos: videoId } }, { new: true })
  if (!videoDeleted) throw new ApiError(500, "problem occured while deleting video from playlist")
    return res.status(200).json(new ApiResponse(200, videoDeleted, "added video to playlist successfully"))
  
})

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  // TODO: delete playlist
  const playlistExists = await Playlist.exists({ _id: playlistId })
  if (!playlistExists) throw new ApiError(400, "playlist id is required to remove playlist . not provided or invalid")
    const playlistDeleted = await Playlist.findByIdAndDelete(playlistId)
  if (!playlistDeleted) throw new ApiError(500, "problem occured while deleting playlist")
    return res.status(200).json(new ApiResponse(200, playlistDeleted, "playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  const { name, description } = req.body
  //TODO: update playlist
const playlistExists = await Playlist.exists({ _id: playlistId })
if (!playlistExists) throw new ApiError(400, "playlist id is required to update playlist . not provided or invalid")
const updateData = {};

if (name !== undefined && name.trim().length>0) updateData.name = name;
if (description !== undefined && description.trim().length>0) updateData.description = description;

if (Object.keys(updateData).length === 0) {
  throw new ApiError(400, "At least one field is required to update playlist data");
}

const playlistUpdated = await Playlist.findByIdAndUpdate(playlistId, { $set: updateData }, { new: true,runValidators:true })
if (!playlistUpdated) throw new ApiError(500, "problem occured while updating playlist")
  return res.status(200).json(new ApiResponse(200, playlistUpdated, "playlist updated successfully"))
})

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist
}