import type { Request, Response } from 'express'
import type { SpotifyUser, SpotifyTrack, SpotifyArtist, SpotifyAlbum, SpotifyItemsResponse } from '../../../shared/src/types/spotify'

const express = require('express')

const { check_access_token } = require('../utils/utils')

const router = express.Router()

const fetchWithAuth = async <T>({req, res, url, onSuccess}:
    {
        req: Request
        res: Response
        url: string
        onSuccess: (data: T | null) => Response
    }): Promise<Response> => {
        if (!await check_access_token(req)) {
            return res.status(401).json({ ok: false })
        }
        const access_token = req.session?.spotify_token?.access_token
        if (!access_token) {
            return res.status(401).json({ ok: false })
        }
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${access_token}` }
            })
            if (response.status === 204) {
                return onSuccess(null)
            }
            if (!response.ok) {
                const text = await response.text().catch(() => '')
                console.error('Spotify error: ', response.status, text)
                return res.status(response.status).json({
                    error: 'Spotify API error',
                    status: response.status
                })
            }

            const data = await response.json() as T
            return onSuccess(data)
        } catch (error) {
            console.error(error)
            return res.status(500).json({ error: 'Internal Server Error'})
        }
    }

router.get('/session', async (req, res) => {
    if (req.session.spotify_token && await check_access_token(req)) {
        return res.json({logged_in: true})

    } else {
        return res.json({logged_in: false})
    }
})

router.get('/user-info', async (req, res) => {
    await fetchWithAuth<SpotifyUser>({
        req,
        res,
        url: 'https://api.spotify.com/v1/me',
        onSuccess: (data) => {
            if(!data) {
                return res.status(204).send()
            } else {
                const user: SpotifyUser = {
                    userId: data.id,
                    email: data.email,
                    display_name: data.display_name,
                    images: data.images ?? [],
                    country: data.country,
                    product: data.product,
                }
                return res.json(user)
            }
        }
    })
})

router.get('/top-tracks', async (req, res) => {
    const time_range = req.query.time_range || 'short_term'
    const limit = Number(req.query.limit) || 20
    const offset = Number(req.query.offset) || 0

    await fetchWithAuth<SpotifyItemsResponse<SpotifyTrack>>({
        req, res, 
        url: `https://api.spotify.com/v1/me/top/tracks?time_range=${time_range}&limit=${limit}&offset=${offset}`,
        onSuccess: (data) => {
            const tracks = data.items.map((track: SpotifyTrack) => ({
                id: track.id,
                uri: track.uri,
                name: track.name,
                duration_ms: track.duration_ms,
                artists: track.artists.map((artist: Artist) => ({
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
})

router.get('/top-artists', async (req, res) => {
    const time_range = req.query.time_range || 'short_term'
    const limit = Number(req.query.limit) || 20
    const offset = Number(req.query.offset) || 0
    await fetchWithAuth<SpotifyItemsResponse<SpotifyArtist>>({
        req, res,
        url: `https://api.spotify.com/v1/me/top/artists?time_range=${time_range}&limit=${limit}&offset=${offset}`,
        onSuccess: (data) => {
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

})

router.get('/:id/playlists', async (req, res) => {
    if (!await check_access_token(req)) {
        return res.status(401).json({ ok: false })
    }
    const access_token = req.session.spotify_token.access_token
    const userId = req.params.id
    const limit = Number(req.query.limit) || 50
    const offset = Number(req.query.offset) || 0
    try {
        let response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${access_token}` }
        })

        let initData = await response.json()
        let jsonResponse = initData.items

        while (initData.next) {
            response = await fetch(initData.next, {
                method: 'GET', headers: { 'Authorization': `Bearer ${access_token}` }
            })
            initData = await response.json()
            jsonResponse = jsonResponse.concat(initData.items)
        }

        jsonResponse = jsonResponse.map((playlist) => ({
                id: playlist.id,
                uri: playlist.uri,
                name: playlist.name,
                ownerId: playlist.owner.id,
                tracksHref: playlist.tracks.href
            }))

        res.json(jsonResponse)
    } catch (error) {
        console.error(`get query error (playlists): ${error}`)
        return res.status(500).json({ error: 'Failed to get query'})
    }
})

router.get('/saved-songs', async (req, res) => {
    const limit = Number(req.query.limit) || 20
    const offset = Number(req.query.offset) || 0

    await fetchWithAuth<SpotifyTrack[]>({
        req, res,
        url: `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`,
        onSuccess: (data) => {
            return res.json(data)
        }
    })
})

module.exports = router