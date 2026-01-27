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
    const [player, setPlayer] = useState<SpotifyPlayer | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [deviceId, setDeviceId] = useState<string | null>(null)
    const [currTrack, setCurrTrack] = useState<WebPlaybackTrack | null>(null)
    const [isPaused, setIsPaused] = useState<boolean>(false)
    const [volume, setVolume] = useState<number>(0)
    const [position, setPosition] = useState<number>(0)

    const scriptLoaded = useRef(false)

    const changeVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(Number(event.target.value))
        player?.setVolume(volume)
    }

    const dummy = async () => {
        try{
            const res = await fetch(`/api/spotify-player/get_playback_state`, { credentials: 'include' })
            console.log(res)
        } catch (error) {
            console.error(`there was error: ${error}`)
        }
    }

    const changePlayback = async () => {
        try {
            const res = await fetch(`/api/spotify-player/transfer-playback?device_id=${deviceId}&play=${true}`, { 
                method: 'PUT',
                credentials: 'include'
            })
            if (!res.ok) throw new Error('Failed changing playback device')

            console.log(await res.json())
        } catch(error) {
            console.error(`changePlayback error: ${error}`)
        }
    }

    useEffect(() => {
        if (scriptLoaded.current) return
        scriptLoaded.current = true

        const script = document.createElement('script')
        script.src = 'https://sdk.scdn.co/spotify-player.js'
        script.async = true

        document.body.appendChild(script)
        
        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'Web Player Bob',
                getOAuthToken: async (cb: (token: string) => void) => {
                    try {
                        const res = await fetch('/api/auth/token', { credentials: 'include' })
                        const data = await res.json()
                        if (data.access_token) {
                            cb(data.access_token)
                        } else {
                            // Token expired or not authenticated - show error
                            console.error('No valid token available:', data.error)
                            setError('Session expired. Please log in again.')
                        }
                    } catch (err) {
                        console.error('Failed to get token:', err)
                        setError('Failed to authenticate with Spotify')
                    }
                },
                volume: 0.5
            })
            setPlayer(player)

            // Error listeners
            player.addListener('initialization_error', ({ message }: { message: string }) => {
                console.error('Initialization error:', message)
                setError(message)
            })
            player.addListener('authentication_error', ({ message }: { message: string }) => {
                console.error('Authentication error:', message)
                setError(message)
            })
            player.addListener('account_error', ({ message }: { message: string }) => {
                console.error('Account error:', message)
                setError('Premium account required for playback')
            })

            

            player.addListener('ready', ({ device_id } : WebPlaybackPlayer) => {
                setDeviceId(device_id)
                console.log(`Ready with device id: ${device_id}`)
            })
            player.addListener('not_ready', ({ device_id }: WebPlaybackPlayer) => {
                console.log(`Device id has gone offline: ${device_id}`)
            })
            player.addListener('player_state_changed', (state: WebPlaybackState) => {
                if (!state) {
                    return
                }
                console.log(state)

                setCurrTrack(state.track_window.current_track)
                setIsPaused(state.paused)
                setPosition(state.position)
                
                player.getVolume().then((volume:number) => {
                    setVolume(volume)
                })

            });

            player.connect()
        }

        // Cleanup on unmount
        return () => {
            if (player) {
                player.disconnect()
            }
        }
    },[player])


    return (
        <div>
            {deviceId &&
                <div>
                    <h1>Spotify Web Player</h1> 
                    <div>device id: {deviceId}</div>
                    <button onClick={dummy}>Start playback?</button>
                    {player &&
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
                    }
                    

                </div>
                          
            }

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    )
}