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

        const base = {
            is_playing: data.is_playing,
            timestamp: data.timestamp,
            progress_ms: data.progress_ms,
            currently_playing_type: data.currently_playing_type
        }

        const snapshot = {
            ...base,
            item: data.item && data.currently_playing_type === 'track' ? {
                id: data.item.id,
                uri: data.item.uri,
                name: data.item.name,
                duration_ms: data.item.duration_ms,
                artists: data.item.artists.map((artist) => ({
                    id: artist.id,
                    uri: artist.uri,
                    name: artist.name
                })),
                album: {
                    id: data.item.album.id,
                    uri: data.item.album.uri,
                    name: data.item.album.name,
                    release_date: data.item.album.release_date,
                    total_tracks: data.item.album.total_tracks,
                    images: data.item.album.images
                }  
            } : null
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