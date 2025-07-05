import { Router } from 'express';
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT); // All routes are JWT protected

/**
 * @swagger
 * tags:
 *   name: Video
 *   description: Video management and publishing
 */

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Get all videos for a user filtered by query
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch videos for
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query to filter videos by title
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of videos per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortType
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: List of videos fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     videoCount:
 *                       type: integer
 *                     videos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Video'
 *                     currentPage:
 *                       type: integer
 *                 message:
 *                   type: string
 *                   example: videos fetched successfully
 *       400:
 *         description: Bad request (missing userId or query)
 *       500:
 *         description: Server error
 *   post:
 *     summary: Publish a new video
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - videoFile
 *               - thumbnail
 *               - title
 *             properties:
 *               videoFile:
 *                 type: string
 *                 format: binary
 *                 description: Video file to upload
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Thumbnail image for the video
 *               title:
 *                 type: string
 *                 description: Title of the video
 *               description:
 *                 type: string
 *                 description: Description of the video
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoResponse'
 *       401:
 *         description: Unauthorized - user not logged in
 *       404:
 *         description: Missing required files or upload failure
 */

router.route("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 }
    ]),
    publishAVideo
  );

/**
 * @swagger
 * /videos/{videoId}:
 *   get:
 *     summary: Get video by ID
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the video to fetch
 *     responses:
 *       200:
 *         description: Single video data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoResponse'
 *       401:
 *         description: Missing or invalid videoId
 *       404:
 *         description: Video not found
 *   delete:
 *     summary: Delete a video by ID
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the video to delete
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoResponse'
 *       400:
 *         description: User not logged in
 *       401:
 *         description: Unauthorized - user not owner of the video
 *       404:
 *         description: Video not found
 *   patch:
 *     summary: Update video thumbnail or metadata
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the video to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoResponse'
 *       400:
 *         description: No fields provided to update
 *       401:
 *         description: Unauthorized - user not owner or invalid videoId
 *       404:
 *         description: Video not found
 */
router.route("/:videoId")
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.single("thumbnail"), updateVideo);

/**
 * @swagger
 * /videos/toggle/publish/{videoId}:
 *   patch:
 *     summary: Toggle publish status of a video
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the video to toggle publish status
 *     responses:
 *       200:
 *         description: Publish status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     acknowledged:
 *                       type: boolean
 *                     modifiedCount:
 *                       type: integer
 *                 message:
 *                   type: string
 *                   example: updated toggle status successfully
 *       401:
 *         description: Unauthorized - user not owner or missing videoId
 *       404:
 *         description: Video not found or update failure
 */
router.route("/toggle/publish/:videoId")
  .patch(togglePublishStatus);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64c3a3d6f8aaf1234567890a
 *         videoFile:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               format: uri
 *               example: https://res.cloudinary.com/demo/video/upload/v1234567/video.mp4
 *             public_id:
 *               type: string
 *               example: video_public_id
 *         thumbnail:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               format: uri
 *               example: https://res.cloudinary.com/demo/image/upload/v1234567/thumbnail.jpg
 *             public_id:
 *               type: string
 *               example: thumbnail_public_id
 *         title:
 *           type: string
 *           example: My Awesome Video
 *         description:
 *           type: string
 *           example: This is a sample description of the video.
 *         duration:
 *           type: number
 *           example: 120
 *         views:
 *           type: integer
 *           example: 42
 *         isPublished:
 *           type: boolean
 *           example: true
 *         owner:
 *           type: string
 *           example: 64c3a3d6f8aaf1234567890b
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     VideoResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 200
 *         data:
 *           $ref: '#/components/schemas/Video'
 *         message:
 *           type: string
 *           example: Video fetched successfully
 */
