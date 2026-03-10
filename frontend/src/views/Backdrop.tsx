import { useEffect } from 'react'
import { useSpotifyPlayerStore } from '../store/useSpotifyPlayerStore'
import { DigitalClock, ProgressBar } from '../components'


export function Backdrop() {
    const fetchSnapshot = useSpotifyPlayerStore((state) => state.fetchSnapshot)

    const is_playing = useSpotifyPlayerStore((state) => state.snapshot?.is_playing)
    const local_progress_ms = useSpotifyPlayerStore((state) => state.local_progress_ms)
    const currently_playing_type = useSpotifyPlayerStore((state) => state.snapshot?.currently_playing_type)//track, episode, or unknown
    
    const currTrackName = useSpotifyPlayerStore((state) => state.snapshot?.trackName) //current track name
    const currTrackDur_ms = useSpotifyPlayerStore((state) => state.snapshot?.trackDuration) //duration in ms
    const currTrackArtists = useSpotifyPlayerStore((state) => state.snapshot?.artistNames) //artists of song
    const currTrackAlbumCovers = useSpotifyPlayerStore((state) => state.snapshot?.albumImgs) //3 item image array


    const snapshotError = useSpotifyPlayerStore((state) => state.snapshotError)

    useEffect(() => {
        const refresh = setInterval(() => {
            fetchSnapshot()
        }, 3000)

        return () => clearInterval(refresh)
    }, [fetchSnapshot])

    useEffect(() => {
        if (!is_playing) return

        const updateProgress = setInterval(() => {
            
        })
    })

    return (
        <div>

            <div className='flex justify-center mx-3'>
                <DigitalClock/>
            </div>
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
                            {currTrackName}
                        </h2>
                        <div className='leading-none opacity-90 italic mt-1'>
                            {currTrackArtists?.join(', ')}
                        </div> 
 
                    </div>

                </div>
                <div>
                    <ProgressBar duration_ms={currTrackDur_ms ?? 0} progress_ms={local_progress_ms}></ProgressBar>
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