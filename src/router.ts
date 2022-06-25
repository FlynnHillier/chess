import * as express from "express"
import ErrorLogger from "./util/logging/ErrorLog"

import apiRouter from "./api/api-router"


const router = express.Router()

router.use("a",apiRouter)

router.use("*",(req: express.Request,res : express.Response,next)=>{
    res.status(404).send("404")
})

router.use((errStack : string ,req:express.Request,res:express.Response,next : express.NextFunction)=>{
    ErrorLogger.log("unexpected",errStack,req.method,req.url,req.headers,req.body)
    res.status(500).send("500 internal server error")
})


export default router