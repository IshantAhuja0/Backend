import { Router } from 'express';
import {
  getLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
  toggleTweetLike,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // JWT auth for all routes

/**
 * @swagger
 * tags:
 *   - name: Like
 *     description: Like and unlike videos, comments, and tweets
 */

/**
 * @swagger
 * /likes/toggle/v/{videoId}:
 *   post:
 *     summary: Toggle like on a video
 *     tags: [Like]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the video to like/unlike
 *     responses:
 *       200:
 *         description: Video like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   description: Like document info or deletion info
 *                 message:
 *                   type: string
 *                   example: Video liked/unliked successfully
 *       400:
 *         description: Bad request - videoId or userId missing
 *       404:
 *         description: Video or user not found
 */

/**
 * @swagger
 * /likes/toggle/c/{commentId}:
 *   post:
 *     summary: Toggle like on a comment
 *     tags: [Like]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to like/unlike
 *     responses:
 *       200:
 *         description: Comment like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - commentId or userId missing
 *       404:
 *         description: Comment or user not found
 */

/**
 * @swagger
 * /likes/toggle/t/{tweetId}:
 *   post:
 *     summary: Toggle like on a tweet
 *     tags: [Like]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tweetId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tweet to like/unlike
 *     responses:
 *       200:
 *         description: Tweet like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - tweetId or userId missing
 *       404:
 *         description: Tweet or user not found
 */

/**
 * @swagger
 * /likes/videos:
 *   get:
 *     summary: Get all liked videos of the current user
 *     tags: [Like]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of liked videos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       videoDetails:
 *                         type: object
 *                         properties:
 *                           videoFile:
 *                             type: string
 *                           thumbnail:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           duration:
 *                             type: number
 *                           views:
 *                             type: integer
 *                           ownerDetails:
 *                             type: object
 *                             properties:
 *                               fullname:
 *                                 type: string
 *                               username:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                 message:
 *                   type: string
 *                   example: Fetched all liked videos successfully
 *       400:
 *         description: User not logged in
 *       404:
 *         description: No liked videos found or error occurred
 */

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router;
