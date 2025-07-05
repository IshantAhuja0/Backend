import { Router } from 'express';
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // All routes below require JWT

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Channel dashboard statistics and videos
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get channel statistics including subscribers, videos, views, and likes counts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Channel statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscribersCount:
 *                   type: integer
 *                   description: Total number of subscribers
 *                 videosCount:
 *                   type: integer
 *                   description: Total number of videos uploaded
 *                 totalViews:
 *                   type: integer
 *                   description: Total views across all videos
 *                 totalLikes:
 *                   type: integer
 *                   description: Total likes across all videos
 *                 email:
 *                   type: string
 *                   description: Channel owner's email
 *       401:
 *         description: Unauthorized - user not logged in
 *       404:
 *         description: Channel stats not found
 */
router.route("/stats").get(getChannelStats);

/**
 * @swagger
 * /dashboard/videos:
 *   get:
 *     summary: Get all videos uploaded by the channel, sorted by newest first
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of channel videos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   videoFile:
 *                     type: string
 *                   thumbnail:
 *                     type: string
 *                   owner:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   views:
 *                     type: integer
 *                   isPublished:
 *                     type: boolean
 *       401:
 *         description: Unauthorized - user not logged in
 *       404:
 *         description: Channel videos not found
 */
router.route("/videos").get(getChannelVideos);

export default router;
