import path from "path"
const config = {
    express:{
        port:5000,
        session:{
            secret:process.env.secret || "Lima Mike Alpha Oscar",
            mongo_store_uri:process.env.MONGO_URI
        }
    },
    logs:{
        outDir:path.join(__dirname,"logs")
    }
}

export default config