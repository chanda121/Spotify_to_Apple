import { useState, useEffect } from "react"

export function DigitalClock() {
    const [time, setTime] = useState(new Date().toLocaleTimeString())

    useEffect(()=> {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString('en-US'))
        }, 1000)

        return () => clearInterval(timer)

    }, [])

    return (
        <div>
            <h1>{time}</h1>
        </div>
    )
}