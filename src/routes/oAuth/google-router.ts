import passport from "passport"

import "./google-passport"

import express from "express"


const router = express.Router()

router.get("/",passport.authenticate("google",{scope:["email","profile"]}))
router.get("/redirect",passport.authenticate("google",
    {
        successRedirect:"/",
        failureRedirect:"/login",
    }
    ),
)




export default router