import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
const app=express();
app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes 
import userRoute from "./routes/user.routes.js"
import videoRoute from "./routes/video.routes.js"
import likeRoute from "./routes/like.routes.js"
import commentRoute from "./routes/comment.routes.js"
import subscriptionRoute from "./routes/subscription.routes.js"
import playlistRoute from "./routes/playlist.routes.js"
import healthcheckRoute from "./routes/healthcheck.routes.js"
import tweetRoute from "./routes/tweet.routes.js"
// routes declaration
app.use('/api/v1/users',userRoute)
app.use('/api/v1/videos',videoRoute)
app.use('/api/v1/likes',likeRoute)
app.use('/api/v1/comments',commentRoute)
app.use('/api/v1/subscriptions',subscriptionRoute)
app.use('/api/v1/playlists',playlistRoute)
app.use('/api/v1/healthcheck',healthcheckRoute)
app.use('/api/v1/tweets',tweetRoute)

export {app};