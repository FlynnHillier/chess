import {model,Schema} from "mongoose"

const userSchema = new Schema({
    oAuthProvider:{
        type:String,
        required:true,
    },
    id:{
        type:String,
        required:true,
    },
    displayName:{
        type:String,
        required:true,
    }
})



export default model("user",userSchema)