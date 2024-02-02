// require('dotenv').config({path: './env'}) this wwill run fine but problem is that It will disrupt my consistency of code as I am using import in rest of the  places.

import dotenv from "dotenv"
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})
connectDB()

/*
import express from "express"
const app = express()

;( async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERRR : ",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR :",error)
        throw error
    }
})()
*/