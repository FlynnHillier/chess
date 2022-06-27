import passport from "passport"

import "./google-passport"

import express from "express"


const router = express.Router()

router.get("/",passport.authenticate("google",{scope:["email","profile"]}))
router.get("/redirect",passport.authenticate("google",{failureRedirect:"/login"}),
function(req,res){
    res.redirect("/")
})




export default router