import mongoose,{Schema} from "mongoose"

const subscriptionSchema = new Schema({
    //both subscriber and channel are users only
    subscriber:{
        type:Schema.Types.ObjectId,//one who is subscribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,//the owner of the channel
        ref:"User"
    }
},{timestamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema)