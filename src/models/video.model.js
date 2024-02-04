import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile:{
        type: String,//From cloudinary url
        required:true,
    },
    thumbnail:{
        type: String,//From cloudinary url
        required:true,        
    },
    title:{
        type: String,
        required:true,        
    },
    description:{
        type: String,
        required:true,        
    },
    duration:{
        type: Number,//from cludinary it will send the data
        required:true,        
    },
    views:{
        type:Number,
        default:0
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},
{
    timestamps:true,
})

//mongooseAggregatePaginate will be used as a plugin because ye mongoose ke ane ke baad aya tha

videoSchema.plugin(mongooseAggregatePaginate)//we are plugging in mongoose aggregate pipeline

export const Video = mongoose.model("Video",videoSchema)