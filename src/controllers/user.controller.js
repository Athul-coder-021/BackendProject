import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt  from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId)=>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //you need to put refreshToken in database so that every time you don't need to ask for password
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    }
    catch(error)
    {
        throw new ApiError(500,"Something went wrong while generating refres and acccess token")
    }
}

const registerUser = asyncHandler(async(req,res)=>{
    /* 
    THIS WAS JUST FOR TESTING THE ROUTE
    // return res.status(200).json({
    //     message : "ok",
    //     name :"Athul"
    // })
    */

    // Actual setup
    //what we require
    // get user details from frontend
    // validation-not empty
    // check if user already exist or not - using username and email
    // check for images,check for avatar(required)
    //upload them to cloudinary and check whether u get back the url or not
    // after this create a object of user class - create entry in database
    // remove password and refresh token field from response
    // check for user creation
    // return response
  
// get user details from frontend
    const {fullname,email,username,password} = req.body
    console.log("email : ",email);

// validation 

    // if (fullname === "") {
    //     throw new ApiError(400,"fullname is required")
    // } like this u can write if else condition for each validation

    if(
        [fullname,email,username,password].some((field)=>field?.trim() === ""
        )
    )
    {
        throw new ApiError(400,"All fields are required")
    }

// check if user already exist or not - using username and email
  
  const existedUser = await User.findOne({
    $or: [{ username },{ email }]
  }) 

  if(existedUser)
  {
    throw new ApiError(409,"User with email or username already exists")
  }

// check for images,check for avatar(required)
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
    if(!avatarLocalPath)
    {
        throw new ApiError(400,"Avatar file is required")
    }

//upload them to cloudinary and check whether u get back the url or not
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    
    if(!avatar)
    {
        throw new ApiError(400,"Avatar file is required")
    }

// after this create a object of user class - create entry in database    

    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

// check whether user is created in db or not and (remove password and refresh token field from response)
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )// by default sab selected hota hai isliye hame password wagera ko remove karne ke liye aisa minus sign dalke likna hota hai

    if(!createdUser)
    {
        throw new ApiError(500,"Something went wrong while registering the user")
    }

// response sending

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )
})


const loginUser = asyncHandler(async(req,res)=>{
    //req body->data
    //username or email
    // find the user
    //password check 
    //make access and refresh token
    // send cookie

    const {email,username,password} = req.body

    if(!(username || email))
    {
        throw new ApiError(400,"username or email is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user)
    {
        throw new ApiError(404,"User does not exist")
    }

    const isPassowrdValid= await user.isPasswordCorrect(password)

    if(!isPassowrdValid)
    {
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // cookies bhejo

    const options = {
        httpOnly:true,// cookies can be changed now only from server not from front end.
        secure:true
    }
    // console.log(accessToken,refreshToken)
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken//user apne server mai set karna chah rha ho ,isliye ham usko alag se bhej rhe hai incase loggedInUser can't provide that
            },
            "User logged In Successfully"

        )
    )
})

const logOutUser = asyncHandler(async(req,res)=>{
    // how will we select the user
    // we can't use the id as we cannot ask user to enter his or her id for loggin out  
    // Otherwise he can logout anyone he wishes
    // To avoid this problem we will be using middlewares

    await User.findByIdAndUpdate(
         req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options = {
        httpOnly:true,// cookies can be changed now only from server not from front end.
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User logged out")
    )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken)
    {
        throw new ApiError(401,"Unauthorized request")
    }
    
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user)
        {
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken)
        {
            throw new ApiError(401,"Refresh token is expired or used")
    
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?._id)//user will be logged in to do this therefore we can get id from auth token
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect)
    {
        throw new ApiError(400,"Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))
})  


const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(200,req.user,"current user fetched")
    // we can get current user from auth middleware 
    // as auth middleware is already used therefore we get current user already.
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullname,email}=req.body

    if(!fullname || !email)
    {
        throw new ApiError(400,"All fields are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email:email
            }
        },
        {
            new : true
        }
    ).select("-passowrd")

    return res.status(200)
    .json(new ApiResponse(200,user,"Account details Upated successfully"))




})


const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath)
    {
        throw new ApiError(400,"Avatar file is missing")
        
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url)    
    {
        throw new ApiError(400,"Error while re-uploading avatar on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password")


    return res.status(200)
    .json(
        new ApiResponse(200,user,"Avatar Image updated successfully")
    )
})

const updateUserCoverImgae = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath)
    {
        throw new ApiError(400,"Avatar file is missing")
        
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url)    
    {
        throw new ApiError(400,"Error while re-uploading avatar on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200,user,"Cover Image updated successfully")
    )
})



export {registerUser,loginUser,logOutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImgae}