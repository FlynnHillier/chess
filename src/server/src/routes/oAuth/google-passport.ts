import config from "../../config"

import UserModel from "./../../mongo/models/user"

import passport from "passport"
import {Strategy} from "passport-google-oauth20"

passport.use(new Strategy({
    clientID: config.oAuth.google.clientID,
    clientSecret: config.oAuth.google.clientSecret,
    callbackURL: `http://localhost:${config.express.port}/o/google/redirect`,
  },
  async function (accessToken, refreshToken, profile, done) { //once user has logged in with google.
    try {
        const existingUserCredentials = await UserModel.findOne({
            id:profile.id,
            oAuthProvider:"google"
        })

        if(existingUserCredentials){
            return done(null,existingUserCredentials)
        } else{
            const newUserCredentials = await UserModel.create({
                id:profile.id,
                oAuthProvider:"google",
                displayName:profile.displayName,
            })

            return done(null,newUserCredentials)
        }
    } catch(err){
        return done(err as Error,undefined)
    }
  }
));

passport.serializeUser((user,done)=>{
    done(null,user)
})

passport.deserializeUser((user,done)=>{
    done(null,user as Express.User)
})
