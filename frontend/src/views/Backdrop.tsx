import { useEffect, useState, useRef } from "react"
import type { WebPlaybackPlayer, WebPlaybackState, WebPlaybackTrack } from '../types/spotify'

interface SpotifyPlayer {
    addListener: (event: string, callback: (data: unknown) => void) => void
    connect: () => Promise<boolean>
    disconnect: () => void
    togglePlay: () => Promise<void>
    previousTrack: () => Promise<void>
    nextTrack: () => Promise<void>
    getVolume: () => Promise<number>
    setVolume: (volume:number) => Promise<void>
    getCurrentState: () => Promise<WebPlaybackState | null>
}

export function Backdrop() {
    const [deviceId, setDeviceId] = useState<string | null>(null)
    const [currTrack, setCurrTrack] = useState<WebPlaybackTrack | null>(null)
    const [position, setPosition] = useState<number>(0)



    return (
        <div>
            <div>
                <h1>Spotify Web Player</h1> 
                <div className='outline-2'>
                    <div className='flex flex-col items-center'>

                        <div key='now-playing' className='font-bold'>
                            {currTrack && currTrack.name}
                        </div>
                        <div className='flex p-1 gap-2'>
                            {currTrack && currTrack.artists.map((artist, index) => {
                                return <span key={artist.uri} className="italic">
                                            {artist.name}{index < currTrack.artists.length - 1 ? ',' : ''}
                                    </span>
                            })
                            }
                        </div>
                        <div className='grid grid-cols-3 w-full gap-4 p-2'>
                            <div className='flex items-center p-2'>
                                <input id="spotify-volume-slider"
                                        type="range" 
                                        min="0" max="1" 
                                        value={volume} step="0.01" 
                                        onChange={changeVolume}
                                        className="h-2 bg-neutral-quaternary rounded-full cursor-pointer"/>
                            </div>
                            <div id='spotify-playback-buttons' className='flex justify-self-center items-center gap-2'>
                                <button onClick={() => {
                                    player.previousTrack().catch(e => console.error('previousTrack error:', e))
                                }}>
                                    &lt;&lt;
                                </button>
                                <button onClick={() => {
                                    player.togglePlay().catch(e => console.error('togglePlay error:', e))
                                }}>
                                    {isPaused ? 'PLAY' : 'PAUSE'}
                                </button>
                                <button onClick={() => {
                                    player.nextTrack().catch(e => console.error('nextTrack error:', e))
                                }}>
                                    &gt;&gt;
                                </button>                                    
                            </div>
                            <div/>

                        </div>
                    </div>
                </div>                

            </div>
        </div>
    )
}