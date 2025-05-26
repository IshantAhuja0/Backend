
//this function is only used to connect to db its like a wrapper function , in our app we have to connect to db thousands of times direcly calling asyncHandler will reduce our task of copy pasting the connection machenism to db.
//asyncHandler is a higher order function which takes another function as a parameter as returns a funciton
//i think it as i studied debounce concept in which ,the debounce takes funciton and delay as parameter and returns another function

//we are giving a function as an argument and to pass that function's parameter we further taken a callback
const asyncHandler = (reqHandler) => (
  (req, res, next) => {
    //just created a promise ,we can also do it as normally ,make a promise object and then obj.res()...
    Promise
      .resolve(reqHandler(req, res, next))
      .catch((err) => {
        console.log("error in asyncHandler.js file" + err);
        next(err);

      })
  }
)

//we are giving a funciton as an argument and to pass that funciton's parameter we further taken a callback
// const asyncHandler=(fn)=>async (req,res,next)=>{
//   try{
// await fn(req,res,next);
//   }
//   catch(err){
//     // console.log("error in asyncHandler.js file in utils "+err)
//     res.status(err.code||500).json({
//       status:false,
//       message:err.message
//     })
//   }
// }
export default asyncHandler;