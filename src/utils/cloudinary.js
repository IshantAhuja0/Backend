import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudinary=async(filePath)=>{
      try {
        if(!filePath){
          return {status:400,message:"file path not provided or invalid  cloudinary.js"}
        }
        const result=await cloudinary.uploader.upload(filePath,{
          resource_type:"auto"
        })
        console.log("file uploaded successufully"+result.url)
        return {status:200,message:"file uploaded on cloudinary success",result:result}
      } catch (error) {
        fs.unlinkSync(filePath)//remove the locally saved temporarary file as operation got failed
        
        return {status:400,message:"failed to upload file on cloudinary"}
      }
    }