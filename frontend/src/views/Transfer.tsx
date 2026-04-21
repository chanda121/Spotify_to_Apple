import { useEffect } from 'react'
import { useAppleStore } from '../store/useAppleStore'
import { useSpotifyUserStore } from '../store/useSpotifyUserStore'
import { useTransferStore } from '../store/useTransferStore'
import MusicalNoteIcon from '../assets/musical-note.svg'

export function Transfer() {
    const PLAYLIST_IMG_SIZE = 60

    const authorize = useAppleStore(state => state.authorize)
    const fetchApplePlaylists = useAppleStore(state => state.fetchPlaylists)

    const spotifyPlaylists = useSpotifyUserStore(state => state.playlists)
    const fetchPlaylistItems = useSpotifyUserStore(state => state.fetchPlaylistItems)

    const togglePlaylist = useTransferStore(state => state.togglePlaylist)
    const playlistsToTransfer = useTransferStore(state => state.playlistsToTransfer)


    useEffect(() => {
        console.log(playlistsToTransfer)
    }, [playlistsToTransfer])

    const displayPlaylists = () => {
        if (!spotifyPlaylists.length) {
            return <div>No Playlists Yet</div>
        }
        return spotifyPlaylists.map((playlist) => (
            <div className='flex gap-2 items-center p-2 rounded-lg hover:translate-x-4 hover:bg-gray-900/10 dark:hover:bg-white/10 transition-all duration-300' 
                 key={playlist.id}
                 onClick={async () => {
                    console.log(await fetchPlaylistItems(playlist))
                    togglePlaylist(playlist)
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

            <div className='flex gap-1'>
                <div id='spotify-playlist-col' className='flex flex-col gap-2 grow p-2'>
                    {displayPlaylists()}
                </div>
            </div>
        </div>

    )
}