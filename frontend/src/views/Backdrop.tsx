import { useEffect, useState } from 'react'
import { useSpotifyPlayerStore } from '../store/useSpotifyPlayerStore'
import { DigitalClock, ProgressBar } from '../components'


export function Backdrop() {
    const fetchSnapshot = useSpotifyPlayerStore((state) => state.fetchSnapshot)

    const isPlaying = useSpotifyPlayerStore((state) => state.snapshot?.isPlaying)
    const apiProgress = useSpotifyPlayerStore((state) => state.snapshot?.progressMs)
    
    const currTrackName = useSpotifyPlayerStore((state) => state.snapshot?.trackName) //current track name
    const currTrackDurMs = useSpotifyPlayerStore((state) => state.snapshot?.trackDuration) //duration in ms
    const currTrackArtists = useSpotifyPlayerStore((state) => state.snapshot?.artistNames) //artists of song
    const currTrackAlbumCovers = useSpotifyPlayerStore((state) => state.snapshot?.albumImgs) //3 item image array


    const snapshotError = useSpotifyPlayerStore((state) => state.snapshotError)

    const [localProgressMs, setLocalProgressMs ] = useState(apiProgress)



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
            setLocalProgressMs(prev => (prev??0) + 100)
        }, 100)

        return () => clearInterval(updateProgress)
    }, [isPlaying])

    return (
        <div>
            {/* Clock widget */}
            <div className='flex justify-center mx-3'>
                <DigitalClock/>
            </div>
            {/* Currently Playing Widget */}
            <div className='max-w-140 m-auto'>
                <div className='flex items-center gap-3 mb-4'>
                    {/* Album Art */}
                    <div className='flex w-18 h-18 outline-2 rounded-2xl shrink-0'>
                        {currTrackAlbumCovers && currTrackAlbumCovers[2] &&
                            <img src={currTrackAlbumCovers[2].url} className='w-full h-full object-cover rounded-2xl'/>
                        }
                    </div>
                    {/* Track info */}
                    <div className='grow flex flex-col'>
                        <h2 className='leading-tight font-bold text-xl'>
                            {currTrackName ?? `Nothing right now`}
                        </h2>
                        <div className='leading-none opacity-90 italic mt-1'>
                            {currTrackArtists?.join(', ') ?? `Nothing at all`}
                        </div> 
 
                    </div>

                </div>
                <div>
                    <ProgressBar 
                        durationMs={currTrackDurMs ?? 0} 
                        progressMs={localProgressMs ?? 100}/>
                </div>
            </div>                

            {snapshotError &&
                <div className='bg-red-500/10 text-red-400 px-4 py-3 rounded-lg'>
                    Error: {snapshotError}
                </div>
            }
        </div>
    )
}