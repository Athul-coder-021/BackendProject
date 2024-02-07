import mongoose,{Schema} from "mongoose";
import  Jwt  from "jsonwebtoken";
import bcrypt from "bcrypt"


// we will use hooks like pre and post for hashing password
// pre hook will allow us to do something just before the data is about to be saved
//post hook will allow us to do something just after saving the data
const userSchema = new Schema({
    username:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true// like this is used for search engine by doing this it will come into database searching 
    },
    email:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullname:{
        type: String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type: String,// we will use cloudinary url to display the avatar image
        required:true,
    },
    coverImage:{
        type: String,// we will use cloudinary url to display the avatar image
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshToken:{
        type:String,
    }
},
{
    timestamps:true,
})

// there are different kind of operation before which you want to run the hook one of the is "save" , more are there like "validate"

// next
// In Mongoose middleware, the next function is used to signal that the current operation (in this case, the save operation) is complete, and it's time to move on to the next middleware or the actual save operation.

userSchema.pre("save",async function (next){//here we don't use arrow function calling method because we can not use the "this" method in that
    if(!this.isModified("password"))return next();

    this.password = await bcrypt.hash(this.password,10)
    next()
})

// Adding custom methods
// isPassowrdCorrect is a custom method
userSchema.methods.isPasswordCorrect = async function(password)
{
    return await bcrypt.compare(password,this.password)// it return true or false
}

userSchema.methods.generateAccessToken = function(){
    return Jwt.sign(
        {
            _id : this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )

}
userSchema.methods.generateRefreshToken = function(){
    return Jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)