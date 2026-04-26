import { useEffect } from 'react'
import { useAppleStore } from '../store/useAppleStore'
import { useSpotifyUserStore } from '../store/useSpotifyUserStore'
import { useTransferStore } from '../store/useTransferStore'
import MusicalNoteIcon from '../assets/musical-note.svg'
import type { SpotifyPlaylist } from '@shared/types/spotify'


export function Transfer() {
    const PLAYLIST_IMG_SIZE = 60

    const authorize = useAppleStore(state => state.authorize)
    const fetchApplePlaylists = useAppleStore(state => state.fetchPlaylists)

    const spotifyPlaylists = useSpotifyUserStore(state => state.playlists)

    const togglePlaylist = useTransferStore(state => state.togglePlaylist)
    const playlistsToTransfer = useTransferStore(state => state.playlistsToTransfer)

    const test = useTransferStore(state => state.test)

    useEffect(() => {
        console.log(playlistsToTransfer)
    }, [playlistsToTransfer])

    const handleSelect = async (playlist: SpotifyPlaylist) => {
        const element = document.getElementById(playlist.id)
        element?.classList.toggle('selectable-row')

        await togglePlaylist(playlist)
    }

    const displayPlaylists = () => {
        if (!spotifyPlaylists.length) {
            return <div>No Playlists Yet</div>
        }
        return spotifyPlaylists.map((playlist) => (
            <div className='flex gap-2 items-center p-2 rounded-lg hover:translate-x-4 row-hover hover:cursor-pointer' 
                 key={playlist.id}
                 id={playlist.id}
                 onClick={async () => {
                    await handleSelect(playlist)
                 }}
                >
                {
                    playlist.images ? 
                    <img src={playlist.images[0]?.url}
                        width={PLAYLIST_IMG_SIZE}
                        height={PLAYLIST_IMG_SIZE}
                        alt={playlist.name}
                        className='rounded-md object-cover'
                        />
                    :
                    <div className='bg-gray-100 rounded-md object-cover flex justify-center items-center'
                         style={{ width: PLAYLIST_IMG_SIZE, height: PLAYLIST_IMG_SIZE }}
                        >
                        <img src={MusicalNoteIcon} style={{width: PLAYLIST_IMG_SIZE/2, height: PLAYLIST_IMG_SIZE/2}}/>
                    </div>
                }
                <div className='font-bold text-sm truncate'>{playlist.name}</div>
            </div>
        ))
    }

    return (
        <div>
            <div>
                This it the transfer!!
            </div>
            <button onClick={async () => {
                await authorize()
            }}>Authorize Apple</button>
            <button onClick={async () => {
                await fetchApplePlaylists()
            }}>Get A playlists</button>
            <button onClick={async () => {
                await test()
            }}>TEST</button>

            <div className='flex gap-1'>
                <div id='spotify-playlist-col' className='flex flex-col gap-2 grow p-2'>
                    {displayPlaylists()}
                </div>
            </div>
        </div>

    )
}