import { fetchWithAuth, checkAPIResponse } from '../SpotifyAPIClient.js'
import type { SpotifyAPITrack, SpotifyAPIPlaylist, SpotifyItemsResponse, SpotifyPlaylist } from '@shared/types/spotify.js'
import type { Request, Response } from 'express'

export const getPlaylists = async (req: Request, res: Response) => {
    const accessToken = req.session.spotifyToken?.accessToken
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
}

export const getSavedSongs = async (req: Request, res: Response) => {
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
}

export const getPlaylistTracks = async (req: Request, res: Response) => {
    const hrefArr = req.body
}