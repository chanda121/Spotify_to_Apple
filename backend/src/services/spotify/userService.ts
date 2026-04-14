import { fetchWithAuth } from '../SpotifyAPIClient.js'
import { checkAccessToken } from './authService.js'
import type { SpotifyApiUser, SpotifyUser, SpotifyAPITrack, SpotifyArtist, SpotifyItemsResponse } from '@shared/types/spotify.js'
import type { Request, Response } from 'express'

type topQueryParams = {
    timeRange: string,
    limit: number,
    offset: number
}

export const getSession = async (req: Request, res: Response) => {
    if (req.session.spotifyToken && await checkAccessToken(req)) {
        return res.json({loggedIn: true})
    } else {
        return res.json({loggedIn: false})
    }
}

export const getUserInfo = async (accessToken: string) => {
    const userInfoPayload = await fetchWithAuth<SpotifyApiUser>(accessToken, 'https://api.spotify.com/v1/me')
    if (!userInfoPayload) return null

    const user: SpotifyUser = {
        id: userInfoPayload.id,
        email: userInfoPayload.email,
        displayName: userInfoPayload.display_name,
        images: userInfoPayload.images ?? [],
        country: userInfoPayload.country,
        product: userInfoPayload.product,
    }

    return user
}

export const getTopTracks = async (
    accessToken: string, 
    {
        timeRange = 'long_term', 
        limit = 20, 
        offset = 0
    }:Partial<topQueryParams> = {}
    ) => {

    const url = `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}&offset=${offset}`
    const tracksPayload = await fetchWithAuth<SpotifyItemsResponse<SpotifyAPITrack>>(accessToken, url)
        
    if (!tracksPayload) return null

    const topTracks = tracksPayload.items.map((track: SpotifyAPITrack) => ({
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
            
    return topTracks   
}

export const getTopArtists = async (
    accessToken: string, 
    {
        timeRange = 'long_term', 
        limit = 20, 
        offset = 0
    }:Partial<topQueryParams> = {}
    ) => {

    const url = `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}&offset=${offset}`
    const artistsPayload = await fetchWithAuth<SpotifyItemsResponse<SpotifyArtist>>(accessToken, url)
        
    if (!artistsPayload) return null

    const topArtists = artistsPayload.items.map((artist) => ({
        id: artist.id,
        uri: artist.uri,
        name: artist.name,
        images: artist.images?.map((image) => ({
            url: image.url,
            height: image.height,
            width: image.width
        }))
    }))
    return topArtists
}

