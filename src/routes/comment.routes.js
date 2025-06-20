import { Router } from 'express';
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // JWT auth for all routes

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment operations for videos
 */

/**
 * @swagger
 * /comments/{videoId}:
 *   get:
 *     summary: Get all comments for a video
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *   post:
 *     summary: Add a comment to a video
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 */
router.route("/:videoId")
  .get(getVideoComments)
  .post(addComment);

/**
 * @swagger
 * /comments/c/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *   patch:
 *     summary: Update a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 */
router.route("/c/:commentId")
  .delete(deleteComment)
  .patch(updateComment);

export default router;
