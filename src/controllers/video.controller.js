import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.modal.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
  //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    //required things for video upload : videoFile,thumbnail,title ,discription,duration,views,isPublished,owner
    const owner = req.user?._id
    if (!owner) throw new ApiError(401, "login to upload a video, login details not provided from req.user")

    const thumbnailLocalPath = req.files?.thumbnail?.[0].path
    const videoLocalPath = req.files?.videoFile?.[0].path

    if (!thumbnailLocalPath) throw ApiError(404, "thumbnail is required to upload video")
    const thumbnailUploaded = await uploadOnCloudinary(thumbnailLocalPath)
    if (!videoLocalPath) throw ApiError(404, "video file is required to upload video")
    const videoUploaded = await uploadOnCloudinary(videoLocalPath)
    console.log(videoLocalPath)

    if (!thumbnailUploaded) throw ApiError(404, "failed to upload thumbnail on cloudinary")
    if (!videoUploaded) throw ApiError(404, "failed to upload video on cloudinary")

    const video = Video.create({
      videoFile: {
        url: videoUploaded.url,
        public_id: videoUploaded.public_id
      },
      thumbnail: {
        url: thumbnailUploaded.url,
        public_id: thumbnailUploaded.public_id
      },
      title,
      description,
      //need to log videoUpload to get this
      duration: videoUploaded.duration,
      views: 0,
      isPublished: true,
      owner
    })
    if (!video) throw new ApiError(404, "video not uploaded. error while uploading video")
    return res.status(200).json(new ApiResponse(200, video, "video uploaded successfully"))
  } catch (error) {
    throw new ApiError(500, "internal server occured while uploading video")
  }
})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params
})

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
}