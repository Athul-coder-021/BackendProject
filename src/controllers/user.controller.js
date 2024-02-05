import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
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
    const {fullName,email,username,password} = req.body
    console.log("email : ",email);

// validation 

    // if (fullName === "") {
    //     throw new ApiError(400,"fullname is required")
    // } like this u can write if else condition for each validation

    if(
        [fullName,email,username,password].some((field)=>field?.trim() === ""
        )
    )
    {
        throw new ApiError(400,"All fields are required")
    }

// check if user already exist or not - using username and email
  
  const existedUser = User.findOne({
    $or: [{ username },{ email }]
  }) 

  if(existedUser)
  {
    throw new ApiError(409,"User with email or username already exists")
  }

// check for images,check for avatar(required)
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

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
        fullName,
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

export {registerUser}