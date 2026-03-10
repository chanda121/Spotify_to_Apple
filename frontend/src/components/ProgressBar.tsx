
type ProgressBarProps = {
    duration_ms: number,
    progress_ms: number
}

export function ProgressBar({duration_ms, progress_ms}: ProgressBarProps) {
    const percentFull = duration_ms ? Math.min(100, (progress_ms/duration_ms)*100) : 0
    
    return (
        <div className='w-full bg-neutral-quaternary rounded-full h-1 outline-1'>
            <div className='bg-lime-400 h-1 rounded-full transition-[width] duration-200' style={{ width: `${percentFull}%` }}></div>
        </div>
    )

}