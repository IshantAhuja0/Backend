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
 *   name: Subscription
 *   description: Manage user subscriptions and subscribers
 */

/**
 * @swagger
 * /subscriptions/c/{channelId}:
 *   get:
 *     summary: Get the list of channels the current user is subscribed to
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         description: ID of the user to get subscribed channels for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of subscribed channels retrieved successfully
 *   post:
 *     summary: Toggle subscription status to a specific channel
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         description: ID of the channel to subscribe or unsubscribe
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription status toggled successfully
 */
router
  .route("/c/:channelId")
  .get(getSubscribedChannels)
  .post(toggleSubscription);

/**
 * @swagger
 * /subscriptions/u/{subscriberId}:
 *   get:
 *     summary: Get all subscribers of a specific user channel
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriberId
 *         required: true
 *         description: ID of the user channel to get subscribers for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of subscribers retrieved successfully
 */
router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router;
