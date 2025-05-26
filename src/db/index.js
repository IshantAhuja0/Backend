import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB=async ()=>{
try{
const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
// const connectionInstance=await mongoose.connect(process.env.MONGODB_URL);
// const connectionInstance=await mongoose.connect('mongodb+srv://first:first@democluster.dsslt6c.mongodb.net');
console.log("mongodb connected with mongoose ! Host : "+connectionInstance);
}
catch(err){
  console.log("problem in connection : "+err);
  process.exit(1);
}
}
export default connectDB;