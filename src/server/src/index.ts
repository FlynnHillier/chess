import path from "path"

import dotenv from "dotenv"
dotenv.config({path:path.resolve(__dirname,"..","..","..",".env")})

import config from "./config" 
import express from "express"
import router from "./router"
import mongoose from "mongoose"

const app = express()

async function init(){
    await mongoose.connect(config.mongo.connect_uri)

    app.listen(config.express.port,()=>{
        console.log(`began listening on port: ${config.express.port}`)
    })

    app.use(router)
}

init()
