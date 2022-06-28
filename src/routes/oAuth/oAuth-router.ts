import express from "express"
import google from "./google-router"

const router = express.Router()


router.use("/google",google)





export default router