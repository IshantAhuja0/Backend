import { Router } from 'express';
import { healthcheck } from "../controllers/healthcheck.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Healthcheck
 *   description: API availability monitoring
 */

/**
 * @swagger
 * /healthcheck:
 *   get:
 *     summary: Check if the server is running
 *     tags: [Healthcheck]
 *     responses:
 *       200:
 *         description: Server is up and running
 */
router.route('/').get(healthcheck);

export default router;
