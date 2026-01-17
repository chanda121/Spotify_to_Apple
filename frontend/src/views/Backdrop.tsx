import { useEffect, useState, useRef } from "react"
import type { WebPlaybackPlayer, WebPlaybackState, WebPlaybackTrack } from '../types/spotify'

interface SpotifyPlayer {
    addListener: (event: string, callback: (data: unknown) => void) => void
    connect: () => Promise<boolean>
    disconnect: () => void
    togglePlay: () => Promise<void>
    previousTrack: () => Promise<void>
    nextTrack: () => Promise<void>
    getCurrentState: () => Promise<WebPlaybackState | null>
}

export function Backdrop() {
    const [player, setPlayer] = useState<SpotifyPlayer | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [deviceId, setDeviceId] = useState<string | null>(null)
    const [currTrack, setCurrTrack] = useState<WebPlaybackTrack | null>(null)
    const [isPaused, setIsPaused] = useState<boolean>(false)
    const [isActive, setIsActive] = useState<boolean>(false)

    const scriptLoaded = useRef(false)

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
                        }
                    } catch (err) {
                        console.error('Failed to get token:', err)
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

                setCurrTrack(state.track_window.current_track)
                setIsPaused(state.paused)
                
                player.getCurrentState().then( (state:WebPlaybackState) => {
                    return (!state) ? setIsActive(false) : setIsActive(true)
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
            <h1>Spotify Web Player</h1>
            <div>
                <div>device id: {deviceId}</div>
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


                        </div>
                        <div className='flex justify-center'>
                            <button onClick={() => {
                                console.log('Previous clicked, player:', player)
                                player.previousTrack().catch(e => console.error('previousTrack error:', e))
                            }}>
                                &lt;&lt;
                            </button>
                            <button onClick={() => {
                                console.log('Toggle clicked, player:', player)
                                player.togglePlay().catch(e => console.error('togglePlay error:', e))
                            }}>
                                {isPaused ? 'PLAY' : 'PAUSE'}
                            </button>
                            <button onClick={() => {
                                console.log('Next clicked, player:', player)
                                player.nextTrack().catch(e => console.error('nextTrack error:', e))
                            }}>
                                &gt;&gt;
                            </button>                            
                        </div>

                    </div>                
                }
                

            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    )
}