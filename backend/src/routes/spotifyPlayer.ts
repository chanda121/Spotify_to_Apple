import express from 'express'
import type { Request, Response } from 'express'
import { checkAccessToken }  from '../utils/utils.js'
import { SpotifyAPIPlaybackSnapshot } from '@shared/types/spotify.js'

const router = express.Router()

router.get('/get-current-track', async (req: Request, res: Response) => {
    if (!await checkAccessToken(req)) {
        return res.status(401).json({ 
            error: {
                message: 'Invalid or missing access token...'
            }
        })
    }
    const accessToken = req.session.spotify_token?.accessToken

    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            method: 'GET',
            headers: {'Authorization': `Bearer ${accessToken}`}
        })
        if (response.status === 204) {
            return res.json({
                isPlaying: false,
                timestamp: Date.now(),
                progressMs: 0,
                currentlyPlayingType: 'unknown',
                item: null
            })
        }
        if (!response.ok) {
            const text = await response.text().catch(() => '')
            console.error('Spotify error: ', response.status, text)
            return res.status(response.status).json({
                error: {
                    message: 'Spotify API error...'
                }
            })
        }

        const data = await response.json() as SpotifyAPIPlaybackSnapshot

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
    } catch (error) {
        console.error(`Error while getting current playback track: ${error}`)
        return res.status(500).json({ 
            error: {
                message: 'Failed to get playback track'
            }
        })
    }
})

export default router