import { useAppleStore } from '../store/useAppleStore'
import { useSpotifyUserStore } from '../store/useSpotifyUserStore'

export function Transfer() {
    const authorize = useAppleStore(state => state.authorize)
    const fetchPlaylists = useAppleStore(state => state.fetchPlaylists)

    const spotifyPlaylists = useSpotifyUserStore(state => state.playlists)
    console.log(spotifyPlaylists)

    
    return (
        <>
            <div>
                This it the transfer!!
            </div>
            <button onClick={async () => {
                await authorize()
            }}>Authorize Apple</button>
            <button onClick={async () => {
                await fetchPlaylists()
            }}>Get playlists</button>
        </>

    )
}