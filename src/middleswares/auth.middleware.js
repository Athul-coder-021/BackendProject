// ye middleware verify karega ki user hai ya nhi hai

import  jwt  from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req,_,next)=>{
    try {
        // console.log(req.cookies)
        const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        
        if(!token){
                throw new ApiError(401,"Unauthorized request")
        }
        
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        
        if(!user)
        {//discuss about front end
            throw new ApiError(401,"Invalid Access Token")
        }
        
        
        // adding new object to request
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})