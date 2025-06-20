import { Router } from 'express';
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // JWT auth for all routes

/**
 * @swagger
 * tags:
 *   name: Tweets
 *   description: Tweet creation and management
 */

/**
 * @swagger
 * /tweets:
 *   post:
 *     summary: Create a new tweet
 *     tags: [Tweets]
 */
router.route("/").post(createTweet);

/**
 * @swagger
 * /tweets/user/{userId}:
 *   get:
 *     summary: Get all tweets by a user
 *     tags: [Tweets]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 */
router.route("/user/:userId").get(getUserTweets);

/**
 * @swagger
 * /tweets/{tweetId}:
 *   patch:
 *     summary: Update a tweet
 *     tags: [Tweets]
 *     parameters:
 *       - in: path
 *         name: tweetId
 *         required: true
 *         schema:
 *           type: string
 *   delete:
 *     summary: Delete a tweet
 *     tags: [Tweets]
 *     parameters:
 *       - in: path
 *         name: tweetId
 *         required: true
 *         schema:
 *           type: string
 */
router.route("/:tweetId")
  .patch(updateTweet)
  .delete(deleteTweet);

export default router;
