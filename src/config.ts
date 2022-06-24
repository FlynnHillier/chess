import path from "path"
const config = {
    express:{
        port:5000,
    },
    logs:{
        outDir:path.join(__dirname,"logs")
    }
}

export default config