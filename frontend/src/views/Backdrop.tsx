import { useEffect, useState } from 'react'
import { useSpotifyPlayerStore } from '../store/useSpotifyPlayerStore'
import { DigitalClock, ProgressBar } from '../components'

const formatMs = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function Backdrop() {
    const fetchSnapshot = useSpotifyPlayerStore((state) => state.fetchSnapshot)

    const isPlaying = useSpotifyPlayerStore((state) => state.snapshot?.isPlaying)
    const apiProgress = useSpotifyPlayerStore((state) => state.snapshot?.progressMs)

    const currTrackName = useSpotifyPlayerStore((state) => state.snapshot?.trackName)
    const currTrackDurMs = useSpotifyPlayerStore((state) => state.snapshot?.trackDuration)
    const currTrackArtists = useSpotifyPlayerStore((state) => state.snapshot?.artistNames)
    const currTrackAlbumCovers = useSpotifyPlayerStore((state) => state.snapshot?.albumImgs)

    const snapshotError = useSpotifyPlayerStore((state) => state.snapshotError)

    const [localProgressMs, setLocalProgressMs] = useState(apiProgress)

    const albumArtUrl = currTrackAlbumCovers?.[0]?.url ?? currTrackAlbumCovers?.[1]?.url ?? currTrackAlbumCovers?.[2]?.url

    useEffect(() => {
        const refresh = setInterval(() => {
            fetchSnapshot()
        }, 5000)

        return () => clearInterval(refresh)
    }, [fetchSnapshot])

    useEffect(() => {
        setLocalProgressMs(apiProgress)
    }, [apiProgress])

    useEffect(() => {
        if (!isPlaying) return

        const updateProgress = setInterval(() => {
            setLocalProgressMs(prev => (prev ?? 0) + 100)
        }, 100)

        return () => clearInterval(updateProgress)
    }, [isPlaying])

    return (
        <div className='flex min-h-[calc(100dvh-7rem)] flex-col items-center justify-center gap-8'>
            <DigitalClock variant='glass' />

            <div className='backdrop-player-glass w-full max-w-3xl rounded-3xl p-8'>
                <div className='flex flex-col gap-6 sm:flex-row'>
                    <div className={`h-40 w-40 shrink-0 overflow-hidden rounded-2xl ${isPlaying ? 'animate-pulse' : ''}`}>
                        {albumArtUrl ? (
                            <img
                                src={albumArtUrl}
                                alt={currTrackName ?? 'Album art'}
                                className='h-full w-full object-cover'
                            />
                        ) : (
                            <div className='flex h-full w-full items-center justify-center italic opacity-70'>
                                No art
                            </div>
                        )}
                    </div>

                    <div className='min-w-0 flex-1'>
                        <p className='mb-1 text-xs font-semibold uppercase opacity-70'>
                            {isPlaying ? 'Now playing' : 'Paused'}
                        </p>
                        <h2 className='text-2xl font-bold break-words'>
                            {currTrackName ?? 'Nothing playing'}
                        </h2>
                        <p className='mt-2 italic opacity-80 break-words'>
                            {currTrackArtists?.join(', ') ?? 'Open Spotify to start listening'}
                        </p>
                    </div>
                </div>

                <div className='mt-8'>
                    <ProgressBar
                        variant='glass'
                        durationMs={currTrackDurMs ?? 0}
                        progressMs={localProgressMs ?? 0}
                    />
                    <div className='mt-2 flex justify-between text-xs tabular-nums opacity-70'>
                        <span>{formatMs(localProgressMs ?? 0)}</span>
                        <span>{formatMs(currTrackDurMs ?? 0)}</span>
                    </div>
                </div>
            </div>

            {snapshotError && (
                <div className='backdrop-player-glass w-full max-w-3xl rounded-xl p-4 text-red-500 dark:text-red-300'>
                    Error: {snapshotError}
                </div>
            )}
        </div>
    )
}
