import fs from "fs"
import {join} from "path"





type Year = `${number}`
type Month = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12"
type Day = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29" | "30" | "31"

type Hour = "00" | "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23"
type MinSec = "00" | "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29" | "30" | "31" | "32" | "33" | "34" | "35" | "36" | "37" | "38" | "39" | "40" | "41" | "42" | "43" | "44" | "45" | "46" | "47" | "48" | "49" | "50" | "51" | "52" | "53" | "54" | "55" | "56" | "57" | "58" | "59"
type Ms = `${number}`


type Timestamp = {
    date:{
        year:Year,
        month: Month,
        day: Day,
    },
    time:{
        hour: Hour,
        min: MinSec,
        sec: MinSec,
        ms:Ms
    }
}


type Details = Object | null


type logEntry = {
    msg:string,
    timestamp:Timestamp,
    details:Details,
}


type Templater = (...args:string[]) => {msg:string,details:Details}


interface Template {
    [key:string] : Templater
}

interface Logger {
    writePath:string,
    templates:Template
}

class Logger {
    constructor(directory:string,filename:string = "log"){
        this.writePath = join(directory,`${filename}.json`)
        this.templates = {
            "echo":(message:string)=>{return {
                msg:message,
                details:null
            }}
        }
    }

    _timeStamp() : Timestamp{
        const currentDate  = new Date().toISOString()
        const [date,time] = currentDate.split("T")

        const [year,month,day] = date.split("-")
        const [hour,min,sec_ms] = time.split(":")
        const [sec,ms] = sec_ms.split(".")

        return {
            date:{
                year:year as Year,
                month:month as Month,
                day:day as Day,
            },
            time:{
                hour:hour as Hour,
                min:min as MinSec,
                sec:sec as MinSec,
                ms:ms.slice(0,ms.indexOf("Z")) as Ms,
            }
        }
    }

    _write(entry:logEntry) : void{
        //fs.appendFileSync(this.writePath,`${this._timeStamp()} ${message}\n`)
        let logdata = []
        if(fs.existsSync(this.writePath)){
            logdata = JSON.parse(fs.readFileSync(this.writePath,"utf-8"))
            if(!Array.isArray(logdata)){
                throw `log file located: '${this.writePath}' , is chorrupted. ensure JSON is in an array format.`
            }
        }

        logdata.push(entry)
        fs.writeFileSync(this.writePath,JSON.stringify(logdata,null,"\t"))
    }

    newTemplate(name:string,fn :Templater) : void {
        if(this.templates[name]){
            throw Error(`a templating function of name '${name}' already exists.`)
        }
        this.templates[name] = fn
    }

    log(template:string,...args:any[]){
        if(this.templates[template] === undefined){
            throw Error(`log template '${template}' did not exist. Defined template names:  [${Object.keys(this.templates).join(", ")}]  `)
        }

        const templatingFunction =  this.templates[template]
        const expectedParamaterNum : number = templatingFunction.length
        
        if(args.length < expectedParamaterNum){
            throw `logging template '${template}' expects ${expectedParamaterNum} paramaters, but was passed only ${args.length} arguments: [ ${args.join(", ")} ]`
        }

        let templateEntry = templatingFunction.apply(this,args)
        this._write({
            msg:templateEntry.msg,
            timestamp:this._timeStamp(),
            details:templateEntry.details,
        })
    }
}

export default Logger