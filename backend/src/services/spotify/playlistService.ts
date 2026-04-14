import { fetchAllPages } from '../SpotifyAPIClient.js'
import type { SpotifyAPITrack, SpotifyAPIPlaylistTrack, SpotifyAPIPlaylist, SpotifyItemsResponse, SpotifyPlaylist } from '@shared/types/spotify.js'

type playlistParams = {
    id?: string,
    limit: number,
    offset: number,
}

export const getPlaylists = async (
    accessToken: string, 
    {
        limit = 50, 
        offset = 0
    }:Partial<playlistParams> = {}
    ) => {

    const url = `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`
    const playlistsPayload = await fetchAllPages<SpotifyAPIPlaylist>(accessToken, url)

    let playlists: SpotifyPlaylist[] = playlistsPayload.map((playlist: SpotifyAPIPlaylist) => ({
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

    return playlists
            
        
}

export const getLikedSongs = async (
    accessToken: string, 
    {
        limit = 50, 
        offset = 0
    }:Partial<playlistParams> = {}
    ) => {
    const url = `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`
    const likedSongsPayload = await fetchAllPages<SpotifyAPITrack>(accessToken, url)

    return likedSongsPayload
}

export const getPlaylistTracks = async (
    accessToken: string, 
    {
        id = 'LIKED_SONGS',
        limit = 50, 
        offset = 0
    }:Partial<playlistParams> = {}
    ) => {

    if (id === 'LIKED_SONGS') {
        return await getLikedSongs(accessToken)
    }
    const url = `https://api.spotify.com/v1/playlists/${id}/items?limit=${limit}&offset=${offset}`
    const playlistTracksPayload = await fetchAllPages<SpotifyAPIPlaylistTrack>(accessToken, url)

    const tracks = playlistTracksPayload.map(obj => obj.item)


    return tracks
}