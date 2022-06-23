import fs from "fs"
import {join} from "path"

type Templater = (...args:string[]) => string


interface Template {
    [key:string] : Templater
}

interface Logger {
    writePath:string,
    templates:Template
}

class Logger {
    constructor(directory:string,filename:string = "log"){
        this.writePath = join(directory,`${filename}.txt`)
        this.templates = {
            "echo":(s:string)=>{return s}
        }
    }

    _timeStamp() : string{
        const currentDate = new Date().toISOString()
        const [date,time] = currentDate.split("T")
        return `[${date} ${time.slice(0,time.length - 1)}]`
    }

    _write(message:string) : void{
        fs.appendFileSync(this.writePath,`${this._timeStamp()} ${message}\n`)
    }

    newTemplate(name:string,fn :Templater) : void {
        if(this.templates[name]){
            throw Error(`a templating function of name '${name}' already exists.`)
        }
        this.templates[name] = fn
    }

    log(template:string,...args:string[]){
        if(this.templates[template] === undefined){
            throw Error(`log template '${template}' did not exist. Defined template names:  [${Object.keys(this.templates).join(", ")}]  `)
        }

        const templatingFunction =  this.templates[template]
        const expectedParamaterNum : number = templatingFunction.length
        
        if(args.length < expectedParamaterNum){
            throw `logging template '${template}' expects ${expectedParamaterNum} paramaters, but was passed only ${args.length} arguments: [ ${args.join(", ")} ]`
        }

        const message = templatingFunction.apply(this,args)
        this._write(message)
    }
}

export default Logger