
type ProgressBarProps = {
    duration_ms: number,
    progress_ms: number
}

export function ProgressBar({duration_ms, progress_ms}: ProgressBarProps) {
    const percentFull = duration_ms ? Math.min(100, (progress_ms/duration_ms)*100) : 0
    
    return (
        <div className='w-full bg-black dark:bg-white rounded-full h-1 outline-0.5'>
            <div className='bg-white dark:bg-blue-600 h-full ease-linear rounded-full transition-[width] duration-200 flex justify-end items-center' style={{ width: `${percentFull}%` }}>
                <div className='absolute w-4 h-4 rounded-full bg-white dark:bg-blue-600 border-black/5 shadow-sm'/>
            </div>
        </div>
    )

}