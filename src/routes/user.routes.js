import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User registration, profile, and auth APIs
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.route("/register").post(upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverImage", maxCount: 1 }
]), registerUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 */
router.route("/login").post(loginUser);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.route("/logout").post(verifyJWT, logoutUser);

/**
 * @swagger
 * /users/refreshtoken:
 *   post:
 *     summary: Refresh access token
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.route("/refreshtoken").post(refreshAccessToken);

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     summary: Change current password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

/**
 * @swagger
 * /users/current-user:
 *   get:
 *     summary: Get currently logged-in user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User info returned
 */
router.route("/current-user").get(verifyJWT, getCurrentUser);

/**
 * @swagger
 * /users/update-account:
 *   patch:
 *     summary: Update account details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account updated
 */
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

/**
 * @swagger
 * /users/avatar:
 *   patch:
 *     summary: Update user avatar
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated
 */
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

/**
 * @swagger
 * /users/cover-image:
 *   patch:
 *     summary: Update user cover image
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cover image updated
 */
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

/**
 * @swagger
 * /users/c/{username}:
 *   get:
 *     summary: Get user channel profile by username
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Channel profile returned
 */
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

/**
 * @swagger
 * /users/history:
 *   get:
 *     summary: Get user watch history
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Watch history fetched
 */
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
