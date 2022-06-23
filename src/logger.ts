import config from "./config"

function timeStamp(){
    const currentDate = new Date().toISOString()
    const [date,time] = currentDate.split("T")
    return `[${date} ${time.slice(0,time.length - 1)}]`
}