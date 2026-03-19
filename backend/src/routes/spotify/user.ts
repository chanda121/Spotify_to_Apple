import express from 'express'
import type { Request, Response as ExpressResponse } from 'express'
import type { SpotifyApiUser, SpotifyUser, SpotifyAPITrack, SpotifyArtist, SpotifyAPIPlaylist, SpotifyItemsResponse, SpotifyPlaylist } from '@shared/types/spotify.js'
import { checkAccessToken } from '../../utils/utils.js'

const router = express.Router()

/**
 * 
 * @param response fetch API response object to check
 * @param res ExpressResponse object
 * @returns true if response is ok, false if response not ok
 */
const checkAPIResponse = async (response: Response, res: ExpressResponse): Promise<boolean> => {
    if (!response.ok) {
        const text = await response.text().catch(() => '')
        console.error('Spotify error:', response.status, text)
        res.status(response.status).json({
            error: {
                message: 'Spotify API error...'
            }
        })
        return false
    }
    return true
}

const fetchWithAuth =  async <T>({req, res, url, onSuccess}:
    {
        req: Request
        res: ExpressResponse
        url: string
        onSuccess: (data: T | null) => ExpressResponse
    }): Promise<ExpressResponse | void> => {
        if (!await checkAccessToken(req)) {
            console.error(`401 error, unauthorized access`)
            return res.status(401).json({ 
                error: {
                    message: 'Invalid or missing access token...'
                }
             })
        }
        const accessToken = req.session.spotify_token?.accessToken

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            })
            if (response.status === 204) {
                return onSuccess(null)
            }

            if (!await checkAPIResponse(response, res)) return

            const data = await response.json() as T
            return onSuccess(data)
        } catch (error) {
            console.error('fetchWithAuth error:', error)
            return res.status(500).json({ 
                error: {
                    message: 'Internal Server Error'
                }
            })
        }
    }

router.get('/session', async (req: Request, res: ExpressResponse) => {
    if (req.session.spotify_token && await checkAccessToken(req)) {
        return res.json({loggedIn: true})

    } else {
        return res.json({loggedIn: false})
    }
})

router.get('/user-info', async (req: Request, res: ExpressResponse) => {
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
})

router.get('/top-tracks', async (req: Request, res: ExpressResponse) => {
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
})

router.get('/top-artists', async (req: Request, res: ExpressResponse) => {
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

})

router.get('/playlists', async (req: Request, res: ExpressResponse) => {
    if (!await checkAccessToken(req)) {
        return res.status(401).json({ 
            error: {
                message: 'Invalid or missing access token...'
            }
        })
    }
    const accessToken = req.session.spotify_token?.accessToken
    const limit = Number(req.query.limit) || 50
    const offset = Number(req.query.offset) || 0
    try {
        let response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        })

        if (!await checkAPIResponse(response, res)) return


        let initData = await response.json() as SpotifyItemsResponse<SpotifyAPIPlaylist>
        let jsonResponse = initData.items

        while (initData.next) {
            response = await fetch(initData.next, {
                method: 'GET', headers: { 'Authorization': `Bearer ${accessToken}` }
            })
            if (!await checkAPIResponse(response, res)) return

            initData = await response.json() as SpotifyItemsResponse<SpotifyAPIPlaylist>
            jsonResponse = jsonResponse.concat(initData.items)
        }

        const playlists: SpotifyPlaylist[] = jsonResponse.map((playlist: SpotifyAPIPlaylist) => ({
                id: playlist.id,
                uri: playlist.uri,
                name: playlist.name,
                ownerId: playlist.owner.id,
                ownerName: playlist.owner.display_name,
                tracksHref: playlist.items.href
            }))

        return res.json(playlists)
    } catch (error) {
        console.error(`get query error (playlists): ${error}`)
        return res.status(500).json({ 
            error: {
                message: 'Failed to get query'
            }
        })
    }
})



router.get('/saved-songs', async (req: Request, res: ExpressResponse) => {
    const limit = Number(req.query.limit) || 20
    const offset = Number(req.query.offset) || 0

    await fetchWithAuth<SpotifyAPITrack[]>({
        req, res,
        url: `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`,
        onSuccess: (data) => {
            if (!data) {
                return res.status(204).send()
            }
            return res.json(data)
        }
    })
})

export default router