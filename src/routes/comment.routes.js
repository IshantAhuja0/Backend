import { Router } from 'express';
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // All routes are protected

/**
 * @swagger
 * tags:
 *   - name: Comment
 *     description: APIs to manage comments on videos
 */

/**
 * @swagger
 * /comments/{videoId}:
 *   get:
 *     summary: Get all comments for a specific video with pagination support
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the video to fetch comments for
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of comments to return
 *       - in: query
 *         name: lastId
 *         schema:
 *           type: string
 *         description: The last comment ID from previous fetch for cursor pagination
 *     responses:
 *       200:
 *         description: List of comments with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       content:
 *                         type: string
 *                       owner:
 *                         type: string
 *                       video:
 *                         type: string
 *                 nextCursor:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Invalid videoId or query params
 *       404:
 *         description: Video not found or no comments
 * 
 *   post:
 *     summary: Add a new comment to a video
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the video to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Great video!
 *     responses:
 *       200:
 *         description: Comment successfully added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 content:
 *                   type: string
 *                 owner:
 *                   type: string
 *                 video:
 *                   type: string
 *       400:
 *         description: Invalid videoId or missing content
 *       404:
 *         description: Video or user not found
 */
router.route("/:videoId")
  .get(getVideoComments)
  .post(addComment);

/**
 * @swagger
 * /comments/c/{commentId}:
 *   patch:
 *     summary: Update an existing comment's content
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Updated comment text
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 content:
 *                   type: string
 *       400:
 *         description: Invalid commentId or missing content
 *       404:
 *         description: Comment not found
 * 
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       400:
 *         description: Invalid commentId
 *       404:
 *         description: Comment not found
 */
router.route("/c/:commentId")
  .patch(updateComment)
  .delete(deleteComment);

export default router;
