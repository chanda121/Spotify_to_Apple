import type { Request, Response } from 'express'
import { SpotifyAPIPlaybackSnapshot } from '@shared/types/spotify.js'
import { fetchWithAuth } from '../SpotifyAPIClient.js'


export const getCurrentlyPlaying = async (req: Request, res: Response) => {
    await fetchWithAuth<SpotifyAPIPlaybackSnapshot>({
        req,
        res,
        url: 'https://api.spotify.com/v1/me/player/currently-playing',
        onSuccess: (data) => {
            if (!data) {
                return res.json({
                    isPlaying: false,
                    timestamp: Date.now(),
                    progressMs: 0,
                    currentlyPlayingType: 'unknown',
                    item: null
                }) 
            } else {
                let snapshot = {
                    isPlaying: data.is_playing,
                    timestamp: data.timestamp,
                    progressMs: data.progress_ms,
                    currentlyPlayingType: data.currently_playing_type,
                    trackName: data.item && data.currently_playing_type === 'track' ? data.item.name : null,
                    trackDuration: data.item && data.currently_playing_type === 'track' ? data.item.duration_ms : 0,
                    artistNames: data.item && data.currently_playing_type === 'track' ? data.item.artists.map(artist => artist.name) : [],
                    albumImgs: data.item && data.currently_playing_type === 'track' ? data.item.album.images : []
                }

                return res.json(snapshot)
            }
        }
})
}