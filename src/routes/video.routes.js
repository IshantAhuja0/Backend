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

router.use(verifyJWT); // JWT auth for all routes

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Video management and publishing
 */

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Get all videos
 *     tags: [Videos]
 */
router.route("/")
  .get(getAllVideos)

/**
 * @swagger
 * /videos:
 *   post:
 *     summary: Publish a new video
 *     tags: [Videos]
 */
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
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 */
router.route("/:videoId")
  .get(getVideoById)

/**
 * @swagger
 * /videos/{videoId}:
 *   delete:
 *     summary: Delete video
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 */
  .delete(deleteVideo)

/**
 * @swagger
 * /videos/{videoId}:
 *   patch:
 *     summary: Update video (thumbnail only)
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 */
  .patch(upload.single("thumbnail"), updateVideo);

/**
 * @swagger
 * /videos/toggle/publish/{videoId}:
 *   patch:
 *     summary: Toggle publish status of a video
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 */
router.route("/toggle/publish/:videoId")
  .patch(togglePublishStatus);

export default router;
