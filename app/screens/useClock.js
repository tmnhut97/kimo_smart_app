import React, {useState, useEffect } from 'react'

const formatTimeCurrent = (currentDate) => {
    const year = currentDate.getFullYear()
    const month = ("0"+(currentDate.getMonth() + 1)).slice(-2)
    const day = ("0"+currentDate.getDate()).slice(-2)
    const h = ("0"+currentDate.getHours()).slice(-2)
    const m = ("0"+currentDate.getMinutes()).slice(-2)
    const s = ("0"+currentDate.getSeconds()).slice(-2)
    const time = h+":"+m+":"+s
    const date = day+":"+month+":"+year
    return ({time, date});
}
const useClock = () => {
    const [dateTimeCurrent, setDateTimeCurrent ] = useState({time: null, date: null})
    useEffect( () => {
        const intervalDateTime = setInterval( () => {
            const currentDate = new Date();
            setDateTimeCurrent(formatTimeCurrent(currentDate))
        }, 1000)

        return () => { clearInterval(intervalDateTime) }
    }, [])
    return dateTimeCurrent
}
export default useClock
