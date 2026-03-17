import { useState, useEffect } from 'react'

export function useScrollSpy(ids: string[]): string {
    const [activeId, setActiveId] = useState<string>(ids[0])

    useEffect(() => {
        const options: IntersectionObserverInit = {
            root: null, //watch entire browser window
            rootMargin: '-40% 0px -59% 0px',
            threshold: 0,
        }

        const callback: IntersectionObserverCallback = (entries) => {
            entries.forEach((entry) => {
                if(entry.isIntersecting) {
                    setActiveId(entry.target.id)
                }
            })
        }

        const observer = new IntersectionObserver(callback, options)

        ids.forEach((id) => {
            const element = document.getElementById(id)
            if (element) observer.observe(element)
        })

        return  () => observer.disconnect()
    }, [ids])

    return activeId
}