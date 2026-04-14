import { SpotifyAPIPlaybackSnapshot } from '@shared/types/spotify.js'
import { fetchWithAuth } from '../SpotifyAPIClient.js'

export const getCurrentlyPlaying = async (accessToken: string) => {
    const url = 'https://api.spotify.com/v1/me/player/currently-playing'
    const snapshotPayload = await fetchWithAuth<SpotifyAPIPlaybackSnapshot>(accessToken, url)

    if (!snapshotPayload) {
        return {
            isPlaying: false,
            timestamp: Date.now(),
            progressMs: 0,
            currentlyPlayingType: 'unknown',
            item: null
        }
    } 

    const snapshot = {
        isPlaying: snapshotPayload.is_playing,
        timestamp: snapshotPayload.timestamp,
        progressMs: snapshotPayload.progress_ms,
        currentlyPlayingType: snapshotPayload.currently_playing_type,
        trackName: snapshotPayload.item && snapshotPayload.currently_playing_type === 'track' ? snapshotPayload.item.name : null,
        trackDuration: snapshotPayload.item && snapshotPayload.currently_playing_type === 'track' ? snapshotPayload.item.duration_ms : 0,
        artistNames: snapshotPayload.item && snapshotPayload.currently_playing_type === 'track' ? snapshotPayload.item.artists.map(artist => artist.name) : [],
        albumImgs: snapshotPayload.item && snapshotPayload.currently_playing_type === 'track' ? snapshotPayload.item.album.images : []
    }

    return snapshot
    
}
