import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.modal.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { User } from "../models/user.modal.js"


// const getAllVideos = asyncHandler(async (req, res) => {
//   const { lastId, limit = 10, query, sortBy = "title", sortType = "asc", userId } = req.query
//   //TODO: get all videos based on query, sort, pagination
//   const userExists = await User.exists({ _is: userId })
//   if (!userExists) throw new ApiError(400, "userId is required to get videos")
//   let lastVideoId = null;
//   if (lastId && mongoose.Types.ObjectId.isValid(lastId)) {
//     lastVideoId = new mongoose.Types.ObjectId(lastId);
//   }
// const videos = await Video.aggregate([
//   {
//     $match: {
//       owner: new mongoose.Types.ObjectId(userId),
//       ...(query ? { title: { $regex: query, $options: "i" } } : {}),
//       ...(lastId && mongoose.Types.ObjectId.isValid(lastId)
//         ? {
//             _id: {
//               [sortType === "asc" ? "$gt" : "$lt"]: new mongoose.Types.ObjectId(lastId)
//             }
//           }
//         : {})
//     }
//   },
//   {
//     $sort: {
//       [sortBy]: sortType === "asc" ? 1 : -1,
//       _id: 1
//     }
//   },
//   {
//     $limit: parseInt(limit)
//   },
//   {
//     $project: {
//       title: 1,
//       owner: 1,
//       createdAt: 1
//     }
//   }
// ]);

// })
// const getAllVideos = asyncHandler(async (req, res) => {
//   const {
//     lastId,
//     limit = 10,
//     query,
//     sortBy = "title",
//     sortType = "asc",
//     userId
//   } = req.query;

//   // ✅ Validate userId
//   const userExists = await User.exists({ _id: userId });
//   if (!userExists) {
//     throw new ApiError(400, "userId is required to get videos");
//   }

//   // ✅ Prepare filter
//   const filter = { owner: new mongoose.Types.ObjectId(userId) };

//   if (query) {
  //     filter.title = { $regex: query, $options: "i" };
//   }

//   if (lastId && mongoose.Types.ObjectId.isValid(lastId)) {
  //     const lastVideoId = new mongoose.Types.ObjectId(lastId);
  //     filter._id = {
    //       [sortType === "asc" ? "$gt" : "$lt"]: lastVideoId
    //     };
//   }

//   // ✅ Build sort object
//   const sort = {
//     [sortBy]: sortType === "asc" ? 1 : -1
//   };

//   // Always add _id as tie-breaker for pagination stability
//   if (sortBy !== "_id") {
//     sort._id = 1;
//   }

//   // ✅ Run aggregation
//   const videos = await Video.aggregate([
  //     { $match: filter },
  //     { $sort: sort },
//     { $limit: parseInt(limit) },
//     {
//       $project: {
//         title: 1,
//         owner: 1,
//         createdAt: 1
//       }
//     }
//   ]);

//   // ✅ Respond
//   res.status(200).json({
//     success: true,
//     message: "Videos fetched successfully",
//     data: videos,
//     nextCursor: videos.length ? videos[videos.length - 1]._id : null
//   });
// });

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page=1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "asc",
    userId
  } = req.query;

  // ✅ Validate userId
  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    throw new ApiError(400, "userId is required to get videos");
  }
  if(sortType==='asc')sortType=1
  else sortType=-1

 if(!query)throw new ApiError(400,"query is required to fetch videos")

  const aggregate=await Video.aggregate([
    {
      $match:{
        owner:mongoose.Types.ObjectId(userId)
      }
    },
    {
      $match:{
        title:{
          $regex:query
        }
      }
    },
    {
      $sort:{
        [sortBy]:sortType
      }
    }
  ])
  const customLabels={
    totalVideos:"videoCount",
    videos:"videos",
    page:"currentPage"
  }
  const options={page,limit,customLabels}
  const videos=await Video.aggregatePaginate(aggregate,options)
  if(!videos)throw new ApiError(500,"problem occured while fetching videos in server")
  return res.status(200).json(new ApiResponse(200,videos,"videos fetched successfully"))
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

    if (!thumbnailUploaded) throw ApiError(404, "failed to upload thumbnail on cloudinary")
    if (!videoUploaded) throw ApiError(404, "failed to upload video on cloudinary")
    console.log(videoUploaded)

    const video = await Video.create({
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
    console.error("Error uploading video:", error);
    throw new ApiError(500, "Internal server error while uploading video");
  }

})

const getVideoById = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params
    //TODO: get video by id
    if (!videoId) throw new ApiError(401, "video Id is required to get video")
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "no video found against provided video id")
    return res.status(200).json(new ApiResponse(200, video, "video fetched successfully"))
  } catch (error) {
    console.log("error occured while fetching video by id " + error)
    throw new ApiError(500, "internal server error occured while fetching video from id")
  }
})

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  try {
    const { videoId } = req.params
    if (!videoId) throw new ApiError(401, "video Id is required to update video")
    const update = {}

    if (req.body.title) update.title = req.body.title
    if (req.body.description) update.description = req.body.description
    const updateThumbnailPath = req.file?.path
    if (Object.keys(update).length === 0 && !updateThumbnailPath) throw new ApiError(401, "No fields provided to update")

    if (updateThumbnailPath) {
      // const updatedThumbnail=await uploadOnCloudinary(updateThumbnailPath)
      const video = await Video.findById(videoId)
      if (!video) throw new ApiError(404, "provided video id is not correct or invalid")

      const publicId = video.thumbnail?.public_id
      const deleteThumbnail = await deleteFromCloudinary(publicId, 'image')
      const uploadNewthumbnail = await uploadOnCloudinary(updateThumbnailPath)

      if (!uploadNewthumbnail) throw new ApiError(401, "error occured while updating thumbnail")
      update.thumbnail = {
        url: uploadNewthumbnail?.url,
        public_id: uploadNewthumbnail?.public_id
      };
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId, { $set: update }, { new: true, runValidators: true })
    if (!updatedVideo) throw new ApiError(404, "no video found against provided video id")
    return res.status(200).json(new ApiResponse(200, updatedVideo, "video updated successfully"))
  } catch (error) {
    console.log("internal server error occured while updating video", error)
    throw new ApiError(500, "internal server error occured while updating video", error)
  }
})

const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId) throw new ApiError(401, "video Id is required to delete video")
    const videoDeleted = await Video.findByIdAndDelete(videoId)
    if (!videoDeleted) throw new ApiError(404, "no video found against provided video id")
    if (videoDeleted.thumbnail?.public_id) {
      await deleteFromCloudinary(videoDeleted.thumbnail.public_id, 'image')
    }
    if (videoDeleted.video?.public_id) {
      await deleteFromCloudinary(videoDeleted.video.public_id, 'video')
    }
    return res.status(200).json(new ApiResponse(200, videoDeleted, "video deleted successfully"))
  } catch (error) {
    console.log("internal server error occured while deleting video", error)
    throw new ApiError(500, "internal server error occured while deleting video", error)
  }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId) throw new ApiError(401, "video Id is required to toggle publish video status")
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(401, "video not found to update toggle")
    const currentStatus = video.isPublished
    const updatedStatus = currentStatus === true ? false : true
    const updateStatus = await Video.updateOne({ _id: videoId }, { $set: { isPublished: updatedStatus } })
    if (!updateStatus) throw new ApiError(404, "problem occured while updating toggle status")
    res.status(200).json(new ApiResponse(200, updateStatus, "updated toggle status successfully"))
  } catch (error) {
    console.log("internal server error occured while updating toggle status video", error)
    throw new ApiError(500, "internal server error occured while updating toggle status video", error)
  }

})

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
}