import { useEffect } from "react"
import { useSpotifyPlayerStore } from "../store/useSpotifyPlayerStore"
import { DigitalClock } from "../components"


export function Backdrop() {
    const fetchSnapshot = useSpotifyPlayerStore((state) => state.fetchSnapshot)

    const snapshot = useSpotifyPlayerStore((state) => state.snapshot)

    const snapshotError = useSpotifyPlayerStore((state) => state.snapshotError)
    const snapshotLoading = useSpotifyPlayerStore((state) => state.isLoadingSnapshot)

    useEffect(() => {
        const refresh = setInterval(() => {
            fetchSnapshot()
        }, 3000)

        return () => clearInterval(refresh)
    }, [fetchSnapshot])


    return (
        <div>
            <div>
                <DigitalClock/>
                <div className='outline-2'>
                    <div className='flex flex-col items-center'>
                        <div key='now-playing' className='font-bold'>
                            PLACEHOLDER
                        </div>
                        {/* <div className='flex p-1 gap-2'>
                            {currTrack && currTrack.artists.map((artist, index) => {
                                return <span key={artist.uri} className="italic">
                                            {artist.name}{index < currTrack.artists.length - 1 ? ',' : ''}
                                    </span>
                            })
                            }
                        </div> */}
                    </div>
                </div>                

            </div>
        </div>
    )
}