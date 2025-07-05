import { Router } from 'express';
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply JWT verification to all tweet routes
router.use(verifyJWT);

/**
 * @swagger
 * tags:
 *   name: Tweet
 *   description: Tweet creation and management
 */

/**
 * @swagger
 * /tweets:
 *   post:
 *     summary: Create a new tweet
 *     tags: [Tweet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Just posted a tweet!"
 *     responses:
 *       201:
 *         description: Tweet created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.route("/").post(createTweet);

/**
 * @swagger
 * /tweets/user/{userId}:
 *   get:
 *     summary: Get all tweets by a user
 *     tags: [Tweet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tweets for the user
 *       400:
 *         description: Invalid userId
 *       500:
 *         description: Server error
 */
router.route("/user/:userId").get(getUserTweets);

/**
 * @swagger
 * /tweets/{tweetId}:
 *   patch:
 *     summary: Update an existing tweet
 *     tags: [Tweet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tweetId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Updated tweet content"
 *     responses:
 *       200:
 *         description: Tweet updated successfully
 *       400:
 *         description: Invalid input or tweetId
 *       500:
 *         description: Server error
 * 
 *   delete:
 *     summary: Delete a tweet
 *     tags: [Tweet]
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
 *         description: Tweet deleted successfully
 *       400:
 *         description: Invalid tweetId
 *       500:
 *         description: Server error
 */
router.route("/:tweetId")
  .patch(updateTweet)
  .delete(deleteTweet);

export default router;
