import { Router } from "express";
import { registerUser } from "../controllers/User.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
const router = Router()
//upload is a middleware which is written to access input in file and its a part of multer
router.route("/register").post(upload.fields([
  {
    name: "avatar",
    maxCount: 1
  },
  {
    name: "coverImage",
    maxCount: 1
  }
]), registerUser)
export default router