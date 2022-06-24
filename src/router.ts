import * as express from "express"
import ErrorLogger from "./logs/ErrorLog"

import apiRouter from "./api/api-router"


const router = express.Router()

router.use("a",apiRouter)

router.use("*",(req: express.Request,res : express.Response)=>{
    res.status(404).send("404")
})

router.use((err: express.Errback,req:express.Request,res:express.Response,next : express.NextFunction)=>{
    ErrorLogger.log("unexpected",JSON.parse(JSON.stringify(err)).stack,req.method,req.url,req.headers,req.body)
    res.status(500).send("500 internal server error")
})


export default router