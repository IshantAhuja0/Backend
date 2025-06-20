import { Router } from 'express';
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // JWT auth for all routes

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Manage user subscriptions and subscribers
 */

/**
 * @swagger
 * /subscriptions/c/{channelId}:
 *   get:
 *     summary: Get channels subscribed by current user
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *   post:
 *     summary: Toggle subscription to a channel
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 */
router
  .route("/c/:channelId")
  .get(getSubscribedChannels)
  .post(toggleSubscription);

/**
 * @swagger
 * /subscriptions/u/{subscriberId}:
 *   get:
 *     summary: Get subscribers of a user channel
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: subscriberId
 *         required: true
 *         schema:
 *           type: string
 */
router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router;
