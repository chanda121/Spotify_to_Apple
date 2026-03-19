import { fetchWithAuth } from '../SpotifyAPIClient.js'
import { checkAccessToken } from './authService.js'
import type { SpotifyApiUser, SpotifyUser, SpotifyAPITrack, SpotifyArtist, SpotifyItemsResponse } from '@shared/types/spotify.js'
import type { Request, Response } from 'express'


export const getSession = async (req: Request, res: Response) => {
    if (req.session.spotify_token && await checkAccessToken(req)) {
        return res.json({loggedIn: true})

    } else {
        return res.json({loggedIn: false})
    }
}

export const getUserInfo = async (req: Request, res: Response) => {
    await fetchWithAuth<SpotifyApiUser>({
        req,
        res,
        url: 'https://api.spotify.com/v1/me',
        onSuccess: (data) => {
            if (!data) {
                return res.status(204).send()
            } else {
                const user: SpotifyUser = {
                    id: data.id,
                    email: data.email,
                    displayName: data.display_name,
                    images: data.images ?? [],
                    country: data.country,
                    product: data.product,
                }
                return res.json(user)
            }
        }
    })
}

export const getTopTracks = async (req: Request, res: Response) => {
    const timeRange = req.query.time_range || 'short_term'
    const limit = Number(req.query.limit) || 20
    const offset = Number(req.query.offset) || 0

    await fetchWithAuth<SpotifyItemsResponse<SpotifyAPITrack>>({
        req, res, 
        url: `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}&offset=${offset}`,
        onSuccess: (data) => {
            if (!data) {
                return res.status(204).send()
            }
            const tracks = data.items.map((track: SpotifyAPITrack) => ({
                id: track.id,
                uri: track.uri,
                name: track.name,
                durationMs: track.duration_ms,
                artists: track.artists.map((artist: SpotifyArtist) => ({
                    id: artist.id,
                    uri: artist.uri,
                    name: artist.name,
                })),
                album: {
                    id: track.album.id,
                    uri: track.album.uri,
                    name: track.album.name,
                    release_date: track.album.release_date,
                    total_tracks: track.album.total_tracks
                }
            }))
            
            return res.json(tracks)
        }
    })
}

export const getTopArtists = async (req: Request, res: Response) => {
    const timeRange = req.query.time_range || 'short_term'
    const limit = Number(req.query.limit) || 20
    const offset = Number(req.query.offset) || 0
    await fetchWithAuth<SpotifyItemsResponse<SpotifyArtist>>({
        req, res,
        url: `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}&offset=${offset}`,
        onSuccess: (data) => {
            if (!data) {
                return res.status(204).send()
            }
            const artists = data.items.map((artist) => ({
                id: artist.id,
                uri: artist.uri,
                name: artist.name,
                images: artist.images?.map((image) => ({
                    url: image.url,
                    height: image.height,
                    width: image.width
                }))
            }))
            return res.json(artists)
        }
    })
}

