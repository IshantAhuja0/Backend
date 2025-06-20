import { Router } from 'express';
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // JWT auth for all routes

/**
 * @swagger
 * tags:
 *   name: Playlists
 *   description: Playlist management and operations
 */

/**
 * @swagger
 * /playlists:
 *   post:
 *     summary: Create a new playlist
 *     tags: [Playlists]
 */
router.route("/").post(createPlaylist);

/**
 * @swagger
 * /playlists/{playlistId}:
 *   get:
 *     summary: Get playlist by ID
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *   patch:
 *     summary: Update playlist details
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *   delete:
 *     summary: Delete a playlist
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 */
router.route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

/**
 * @swagger
 * /playlists/add/{videoId}/{playlistId}:
 *   patch:
 *     summary: Add a video to a playlist
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 */
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);

/**
 * @swagger
 * /playlists/remove/{videoId}/{playlistId}:
 *   patch:
 *     summary: Remove a video from a playlist
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 */
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

/**
 * @swagger
 * /playlists/user/{userId}:
 *   get:
 *     summary: Get all playlists created by a user
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 */
router.route("/user/:userId").get(getUserPlaylists);

export default router;
