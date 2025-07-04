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
 *   name: Like
 *   description: Like and unlike videos, comments, and tweets
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
 *     responses:
 *       200:
 *         description: Video like toggled
 */
router.route("/toggle/v/:videoId").post(toggleVideoLike);

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
 *     responses:
 *       200:
 *         description: Comment like toggled
 */
router.route("/toggle/c/:commentId").post(toggleCommentLike);

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
 *     responses:
 *       200:
 *         description: Tweet like toggled
 */
router.route("/toggle/t/:tweetId").post(toggleTweetLike);

/**
 * @swagger
 * /likes/videos:
 *   get:
 *     summary: Get all liked videos of current user
 *     tags: [Like]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of liked videos
 */
router.route("/videos").get(getLikedVideos);

export default router;
