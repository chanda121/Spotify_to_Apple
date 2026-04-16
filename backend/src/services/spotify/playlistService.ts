import { fetchAllPages } from '../SpotifyAPIClient.js'
import type { 
    SpotifyTrack, 
    SpotifyAPITrack, 
    SpotifyAPIPlaylistTrack, 
    SpotifyAPILikedSongsObject, 
    SpotifyAPIPlaylist, 
    SpotifyPlaylist } from '@shared/types/spotify.js'

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
    ): Promise<SpotifyPlaylist[]> => {

    const url = `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`
    const playlistsPayload = await fetchAllPages<SpotifyAPIPlaylist>(accessToken, url)

    let playlists: SpotifyPlaylist[] = playlistsPayload.map((playlist: SpotifyAPIPlaylist) => ({
            id: playlist.id,
            name: playlist.name,
            ownerId: playlist.owner.id,
            ownerName: playlist.owner.display_name,
            images: playlist.images
        }))

    playlists = [{
        id: 'LIKED_SONGS',
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
    ): Promise<SpotifyTrack[]> => {
    const url = `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`
    let likedSongsPayload = await fetchAllPages<SpotifyAPILikedSongsObject>(accessToken, url)
    const tracksPayload = likedSongsPayload.map(track => track.track)

    const likedSongs: SpotifyTrack[] = tracksPayload.map(track => ({
        id: track.id,
        name: track.name,
        durationMs: track.duration_ms,
        artists: track.artists.map(artist => ({
            id: artist.id,
            name: artist.name,
        })),
        album: {
            id: track.album.id,
            name: track.album.name,
            releaseDate: track.album.release_date,
            totalTracks: track.album.total_tracks,
            images: track.album.images,
        },
        isrc: track.external_ids.isrc   
    }))

    return likedSongs
}

export const getPlaylistTracks = async (
    accessToken: string, 
    {
        id = 'LIKED_SONGS',
        limit = 50, 
        offset = 0
    }:Partial<playlistParams> = {}
    ): Promise<SpotifyTrack[]> => {

    if (id === 'LIKED_SONGS') {
        return await getLikedSongs(accessToken)
    }
    const url = `https://api.spotify.com/v1/playlists/${id}/items?limit=${limit}&offset=${offset}`
    const playlistTracksPayload = await fetchAllPages<SpotifyAPIPlaylistTrack>(accessToken, url)
    const tracksPayload = playlistTracksPayload.map(track => track.item)

    const tracks = tracksPayload.map(track => ({
        id: track.id,
        name: track.name,
        durationMs: track.duration_ms,
        artists: track.artists.map(artist => ({
            id: artist.id,
            name: artist.name,
        })),
        album: {
            id: track.album.id,
            name: track.album.name,
            releaseDate: track.album.release_date,
            totalTracks: track.album.total_tracks,
            images: track.album.images,
        },
        isrc: track.external_ids.isrc   
    }))

    return tracks
}