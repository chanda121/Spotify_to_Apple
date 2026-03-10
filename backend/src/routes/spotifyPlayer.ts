import express from 'express'
import type { Request, Response } from 'express'
import { check_access_token }  from '../utils/utils.js'
import { SpotifyAPIPlaybackSnapshot } from '@shared/types/spotify.js'

const router = express.Router()

router.get('/get_current_track', async (req: Request, res: Response) => {
    if (!await check_access_token(req)) {
        return res.status(401).json({ 
            error: {
                message: 'Invalid or missing access token...'
            }
        })
    }
    const access_token = req.session.spotify_token?.access_token

    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            method: 'GET',
            headers: {'Authorization': `Bearer ${access_token}`}
        })
        if (response.status === 204) {
            return res.json({
                is_playing: false,
                timestamp: Date.now(),
                progress_ms: 0,
                currently_playing_type: 'unknown',
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
            is_playing: data.is_playing,
            timestamp: data.timestamp,
            progress_ms: data.progress_ms,
            currently_playing_type: data.currently_playing_type,
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