import { User } from "../models/user.modal"
import ApiError from "../utils/apiError"
import asyncHandler from "../utils/asyncHandler"
import jwt from "jsonwebtoken"
try {
  //the accessToken can be in cookie we allowed it through cookieParse or req.header (not in out case)
  //in case of header we get something like this an object {"Authorization": Bearer <token>}, so we need to extract this token
  const verifyJWT=asyncHandler( async(req,res,next)=>{ 
  const accessToken=req.cookies?.accessToken || req.header("Authorization"?.replace("Bearer ",""))
  if(!accessToken) throw new ApiError(401,"Unauthorized Request")
  const decodedToken= jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
  const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
  if(!user) throw new ApiError(401,"Invalid access token")
    req.user=user
  next()
  })
    
  } catch (error) {
    throw new ApiError(401,"Invalid access token")
  }
export {verifyJWT}