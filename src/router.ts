import * as express from "express"

const router : express.IRouter = express.Router()

router.use("")

router.use("*",(req: express.Request,res : express.Response)=>{
    res.status(404).send("404")
})

router.use((err: express.Errback,req:express.Request,res:express.Response,next : express.NextFunction)=>{
    res.status(500).send("500 internal server error")
})


export default router