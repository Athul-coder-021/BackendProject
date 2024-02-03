import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

//middle wares usses : - below:-

//how to accept data from json files like any form filling
app.use(express.json({limit:"16kb"}))//now no need to use body parser middle ware as it already built in express
 

//How to accept data through url
app.use(express.urlencoded({extended:true,limit:"16kb"}))
//extended = true means objects ke andar ibjects ko lena


//koi static folders ko rakne ke liye like pdfs favicon wagera
app.use(express.static("public"))

app.use(cookieParser())//for accesing cookie

//the above middle ware we are using

export {app}