import { useState, useEffect } from 'react'

type DigitalClockProps = {
    variant?: 'default' | 'glass'
}

export function DigitalClock({ variant = 'default' }: DigitalClockProps) {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    const date = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

    if (variant === 'glass') {
        return (
            <div className='backdrop-player-glass rounded-2xl px-8 py-4 text-center'>
                <p className='text-5xl font-light tabular-nums sm:text-6xl'>{time}</p>
                <p className='mt-1 text-sm uppercase opacity-70'>{date}</p>
            </div>
        )
    }

    return (
        <div>
            <h1>{time}</h1>
        </div>
    )
}
