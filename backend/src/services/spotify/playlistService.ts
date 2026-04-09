import { fetchWithAuth, checkAPIResponse, fetchAllPages } from '../SpotifyAPIClient.js'
import type { SpotifyAPITrack, SpotifyAPIPlaylist, SpotifyItemsResponse, SpotifyPlaylist } from '@shared/types/spotify.js'
import type { Request, Response } from 'express'

export const getPlaylists = async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 50
    const offset = Number(req.query.offset) || 0

    const url = `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`

    await fetchAllPages<SpotifyAPIPlaylist>(
        {
            req, res,
            url: url,
            onSuccess: (data) => {
                if(!data) return res.status(204).send()
                const playlists: SpotifyPlaylist[] = data.map((playlist: SpotifyAPIPlaylist) => ({
                        id: playlist.id,
                        uri: playlist.uri,
                        name: playlist.name,
                        ownerId: playlist.owner.id,
                        ownerName: playlist.owner.display_name,
                        images: playlist.images
                    }))

                return res.json(playlists)
            }
        }
    )


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
    const id = req.params.id
    const limit = Number(req.query.limit) || 50
    const offset = Number(req.query.offset) || 0

    await fetchAllPages<SpotifyItemsResponse<SpotifyAPIPlaylist>>({
        req, res,
        url: `https://api.spotify.com/v1/playlists/${id}/items?limit=${limit}&offset=${offset}`,
        onSuccess: (data) => {
            if(!data) {
                return res.status(204).send()
            }
            return res.json(data)
        }
    })
}