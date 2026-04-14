import express from 'express'
import createError from 'http-errors'
import { getSession, getUserInfo, getTopArtists, getTopTracks } from '../../services/spotify/userService.js'
import { getPlaylists, getLikedSongs, getPlaylistTracks } from '../../services/spotify/playlistService.js'
import { requireSpotifyAuth } from '../../middleware/requireAuth.js'
import type { Request, Response } from 'express'

const router = express.Router()

router.get('/session', getSession)

router.get('/user-info', requireSpotifyAuth, async (req: Request, res: Response) => {
    const accessToken = req.session.spotifyToken?.accessToken
    if (!accessToken) throw createError(401, 'Missing access token')

    const data = await getUserInfo(accessToken)

    if (!data) throw createError(502, 'Unexpected empty response from Spotify')
    return res.json(data)
})

router.get('/top-tracks', requireSpotifyAuth, async (req: Request, res: Response) => {
    const accessToken = req.session.spotifyToken?.accessToken
    const timeRange = typeof req.query.time_range === 'string' ? req.query.time_range : 'long_term'
    const limit = Number(req.query.limit) || 20
    const offset = Number(req.query.offset) || 0

    if (!accessToken) throw createError(401, 'Missing access token')
    const data = await getTopTracks(accessToken, {timeRange, limit, offset})

    if (!data) throw createError(502, 'Unexpected empty response from Spotify')
    return res.json(data)
})

router.get('/top-artists', requireSpotifyAuth, async (req: Request, res: Response) => {
    const accessToken = req.session.spotifyToken?.accessToken
    const timeRange = typeof req.query.time_range === 'string' ? req.query.time_range : 'long_term'
    const limit = Number(req.query.limit) || 20
    const offset = Number(req.query.offset) || 0

    if (!accessToken) throw createError(401, 'Missing access token')

    const data = await getTopArtists(accessToken, {timeRange, limit, offset})

    if (!data) throw createError(502, 'Unexpected empty response from Spotify')
    return res.json(data)
})

router.get('/playlists', requireSpotifyAuth, async (req: Request, res: Response) => {
    const accessToken = req.session.spotifyToken?.accessToken
    const limit = Number(req.query.limit) || 50
    const offset = Number(req.query.offset) || 0

    if (!accessToken) throw createError(401, 'Missing access token')
    
    const data = await getPlaylists(accessToken, {limit, offset})

    if (!data) throw createError(502, 'Unexpected empty response from Spotify')
    
    return res.json(data)
})

router.get('/playlists/:id', requireSpotifyAuth, async (req: Request, res: Response) => {
    const accessToken = req.session.spotifyToken?.accessToken
    const limit = Number(req.query.limit) || 50
    const offset = Number(req.query.offset) || 0
    const id = typeof req.params.id === 'string' ? req.params.id : 'LIKED_SONGS'

    if (!accessToken) throw createError(401, 'Missing access token')
    
    const data = await getPlaylistTracks(accessToken, {id, limit, offset})

    if (!data) throw createError(502, 'Unexpected empty response from Spotify')
    
    return res.json(data)
})


export default router