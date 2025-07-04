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
router.use(verifyJWT); // All routes require JWT

/**
 * @swagger
 * tags:
 *   name: Playlist
 *   description: Playlist management and operations
 */

/**
 * @swagger
 * /playlists:
 *   post:
 *     summary: Create a new playlist
 *     tags: [Playlist]
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
 *                 example: "My Playlist"
 *     responses:
 *       201:
 *         description: Playlist created successfully
 */
router.route("/").post(createPlaylist);

/**
 * @swagger
 * /playlists/{playlistId}:
 *   get:
 *     summary: Get playlist by ID
 *     tags: [Playlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Playlist fetched
 *   patch:
 *     summary: Update playlist details
 *     tags: [Playlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Playlist updated
 *   delete:
 *     summary: Delete a playlist
 *     tags: [Playlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Playlist deleted
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
 *     tags: [Playlist]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Video added to playlist
 */
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);

/**
 * @swagger
 * /playlists/remove/{videoId}/{playlistId}:
 *   patch:
 *     summary: Remove a video from a playlist
 *     tags: [Playlist]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Video removed from playlist
 */
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

/**
 * @swagger
 * /playlists/user/{userId}:
 *   get:
 *     summary: Get all playlists created by a user
 *     tags: [Playlist]
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
 *         description: List of playlists for the user
 */
router.route("/user/:userId").get(getUserPlaylists);

export default router;
