import { fetchAllPages } from '../SpotifyAPIClient.js'
import type { SpotifyAPIPlaylistTrack, SpotifyAPIPlaylist, SpotifyItemsResponse, SpotifyPlaylist } from '@shared/types/spotify.js'
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
                let playlists: SpotifyPlaylist[] = data.map((playlist: SpotifyAPIPlaylist) => ({
                        id: playlist.id,
                        uri: playlist.uri,
                        name: playlist.name,
                        ownerId: playlist.owner.id,
                        ownerName: playlist.owner.display_name,
                        images: playlist.images
                    }))
                playlists = [{
                    id: 'LIKED_SONGS',
                    uri: 'test',
                    name: 'Liked Songs',
                    ownerId: 'test',
                    ownerName: 'test',
                }, ...playlists]

                return res.json(playlists)
            }
        }
    )


}

export const getLikedSongs = async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 20
    const offset = Number(req.query.offset) || 0

    await fetchAllPages<SpotifyAPITrack[]>({
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
    if (id === 'LIKED_SONGS') {
        return await getLikedSongs(req, res)
    }

    await fetchAllPages<SpotifyItemsResponse<SpotifyAPIPlaylistTrack>>({
        req, res,
        url: `https://api.spotify.com/v1/playlists/${id}/items?limit=${limit}&offset=${offset}`,
        onSuccess: (data) => {
            if(!data) {
                return res.status(204).send()
            }
            return res.json(data.items)
        }
    })
}