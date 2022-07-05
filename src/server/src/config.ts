import path from "path"
const config = {
    express:{
        port:5000,
        session:{
            secret:process.env.secret || "Lima Mike Alpha Oscar",
        }
    },
    mongo:{
        connect_uri:process.env.MONGO_URI as string,
    },
    oAuth:{
        google:{
            clientID:process.env.GOOGLE_CLIENT_ID as string,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET as string,
        }
    },
    logs:{
        outDir:path.join(__dirname,"logs")
    }
}

export default config