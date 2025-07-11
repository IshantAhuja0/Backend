// require('dotenv').config({path: './env'})
import dotenv from 'dotenv'
import connectDB from "./db/index.js";

import { app } from './app.js';
dotenv.config({
  path: './env'
})
//we have written connectDB as a async function and an async function always returns a promise so we should use .then() and .catch() to handle this promise

connectDB()
  .then(() => {
    const port = process.env.PORT || 8000
    let server = app.listen(port, () => {
      console.log("server is running at port : 8000")
    }
    )
    server.on("error", (err) => {
      console.log("error in connection to db in index.js file" + err);
    })

  })
  .catch((err) => console.log("mongo db connection failed in index.js/src file : " + err))
