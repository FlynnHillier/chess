import config from "./config"

import * as express from "express"
import apiRouter from "./api/api-router"

import session, { MemoryStore, Store } from "express-session"
import MongoSessionStore from "connect-mongo"

import ErrorLogger from "./util/logging/ErrorLog"

const router = express.Router()


router.use(session({
    secret:config.express.session.secret,
    saveUninitialized:true,
    resave:true,
    cookie:{
        sameSite:false,
        secure:process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 14, //2 weeks
    },
    store:MongoSessionStore.create({
        mongoUrl:config.express.session.mongo_store_uri,
        ttl:60 * 60 * 24 * 14, //2 weeks
        autoRemove:"interval",
        autoRemoveInterval:10,
    }) as unknown as Store
}))

router.use("a",apiRouter)

router.use("*",(req: express.Request,res : express.Response,next)=>{
    res.status(404).send("404")
})

router.use((errStack : string ,req:express.Request,res:express.Response,next : express.NextFunction)=>{
    ErrorLogger.log("unexpected",errStack,req.method,req.url,req.headers,req.body)
    res.status(500).send("500 internal server error")
})


export default router