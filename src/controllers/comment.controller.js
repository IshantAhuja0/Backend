import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Video } from "../models/video.modal.js"
import { User } from "../models/user.modal.js"
//we are changing the pagination to skip from lastId rather that skipping all records by calculating
const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params
  const { limit = 10, lastId } = req.query
  const pageLimit = parseInt(limit)
  if (!Video.exists({ _id: videoId })) throw new ApiError(400, "videoId is not provided or invalid for fetching comments")
  let lastCommentId = null;
  if (lastId && mongoose.Types.ObjectId.isValid(lastId)) {
    lastCommentId = new mongoose.Types.ObjectId(lastId);
  }

  //firstly we write aggregation to get all comments 
  //go to Video 
  const comments = await Video.aggregate([
    //matched videoId in db of videos
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId)
      }
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "commentDetails",
        pipeline: [
          //we are staring from lastCommentId as implementing pagination 
          {
            $match: lastCommentId ?
              {
                _id: { $gt: lastCommentId }
              } :
              {}
          },
          {
            $project: {
              content: 1,
              video: 1,
              owner: 1
            }
          },
          //for cursor-pagination(by lastId) we sort comments based on id
          {
            $sort: { _id: 1 }
          },
          {
            $limit: pageLimit
          }
        ]
      }
    },
  ])
  if (!comments || comments.length === 0) throw new ApiError(404, "no comments found for this video, or video does not exist")
  //we got an array in which first object is containing videoId and another array of comments, now we need to het that comment array
  const commentsArray = comments[0]?.commentDetails || []
  //we got last record's id from comment array
  const nextCursor = commentsArray.length > 0
    ? commentsArray[commentsArray.length - 1]._id
    : null;

  const response = {
    comments: comments[0]?.commentDetails || [],
    nextCursor
  }
  res.status(200).json(new ApiResponse(200, response, "fetched comments for video successfully"));

})

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params
  const userId = req.user._id
  const { content } = req.body
  const [videoExists, userExists] = await Promise.all([
    Video.exists({ _id: videoId }),
    User.exists({ _id: userId }),
  ]);
  if (!content || content === "" || content.trim().length === 0) throw new ApiError(401, "content for comment not provided or is empty invalid")
  if (!videoExists) throw new ApiError(404, "Video not found.");
  if (!userExists) throw new ApiError(404, "User not found.");
  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId
  })
  if (!comment) throw new ApiError(404, "failed to post comment on video")
  return res.status(200).json(new ApiResponse(200, comment, "comment posted on video successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params
  const { content } = req.body
  const [commentExists] = await Promise.all([
    Comment.exists({ _id: commentId }),
  ]);
  if (!content || content === "" || content.trim().length === 0) throw new ApiError(401, "content for comment not provided or is empty invalid")
  if (!commentExists) throw new ApiError(400, "Comment not found to update.");
  const updateComment = await Comment.findOneAndUpdate({ _id: commentId },
    { $set: { content } },
    { new: true, runValidators: true }
  )
  if (!updateComment) throw new ApiError(404, "failed to update comment on video")
  return res.status(200).json(new ApiResponse(200, updateComment, "comment updated on video successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params
  const [commentExists] = await Promise.all([
    Comment.exists({ _id: commentId }),
  ]);
  if (!commentExists) throw new ApiError(400, "Comment not found to delete.");
  const deleteComment = await Comment.findByIdAndDelete(commentId )
  if (!deleteComment) throw new ApiError(404, "failed to delete comment on video")
  return res.status(200).json(new ApiResponse(200, deleteComment, "comment deleted on video successfully"))

})

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment
}