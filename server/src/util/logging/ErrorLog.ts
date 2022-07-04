import Logger from "./logger";
import config from "../../config"

let errorLogger = new Logger(config.logs.outDir,"errors");

errorLogger.newTemplate("unexpected",(errorStrack:string,method:string, endpoint:string, headers:Object, body:Object | undefined)=>{
    return {
        msg:"unexpected error",
        details:{
            request:{
                method:method,
                endpoint:endpoint,
                headers:headers,
                body:body
            },
            errorStack:errorStrack
        }
    }
})


export default errorLogger