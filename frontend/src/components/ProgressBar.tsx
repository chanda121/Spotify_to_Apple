
type ProgressBarProps = {
    durationMs: number,
    progressMs: number,
    variant?: 'default' | 'glass'
}

export function ProgressBar({ durationMs, progressMs, variant = 'default' }: ProgressBarProps) {
    const percentFull = durationMs ? Math.min(100, (progressMs / durationMs) * 100) : 0

    const trackClass = variant === 'glass'
        ? 'bg-white/35 dark:bg-white/10'
        : 'bg-pink-200/80 dark:bg-pink-950/60'

    const fillClass = variant === 'glass'
        ? 'bg-white dark:bg-pink-300'
        : 'bg-pink-600 dark:bg-pink-400'

    const thumbClass = variant === 'glass'
        ? 'border-white/80 bg-white dark:border-pink-100 dark:bg-pink-300'
        : 'border-pink-100 bg-pink-600 dark:border-pink-200 dark:bg-pink-400'

    return (
        <div className={`w-full rounded-full h-1.5 ${trackClass}`}>
            <div
                className={`relative h-full ease-linear rounded-full transition-[width] duration-200 flex justify-end items-center ${fillClass}`}
                style={{ width: `${percentFull}%` }}
            >
                <div className={`absolute w-3.5 h-3.5 rounded-full border-2 shadow-sm ${thumbClass}`} />
            </div>
        </div>
    )
}
