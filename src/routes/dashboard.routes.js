import { Router } from 'express';
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // JWT auth for all routes

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Channel dashboard statistics and videos
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get channel statistics
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Channel stats fetched
 */
router.route("/stats").get(getChannelStats);

/**
 * @swagger
 * /dashboard/videos:
 *   get:
 *     summary: Get videos uploaded by the channel
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Channel videos fetched
 */
router.route("/videos").get(getChannelVideos);

export default router;
