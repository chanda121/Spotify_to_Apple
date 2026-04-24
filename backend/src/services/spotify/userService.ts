import { fetchWithAuth } from '../SpotifyAPIClient.js'
import { checkAccessToken } from './authService.js'
import type { SpotifyApiUser, SpotifyUser, SpotifyAPITrack, SpotifyArtist, SpotifyItemsResponse, SpotifyTrack } from '@shared/types/spotify.js'
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

export const getUserInfo = async (accessToken: string): Promise<SpotifyUser | null> => {
    console.log('in getUsers')

    const userInfoPayload = await fetchWithAuth<SpotifyApiUser>(accessToken, 'https://api.spotify.com/v1/me')
    if (!userInfoPayload) return null

    const user = {
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
    ): Promise<SpotifyTrack[] | null> => {
    console.log('in getTracks')

    const url = `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}&offset=${offset}`
    const tracksPayload = await fetchWithAuth<SpotifyItemsResponse<SpotifyAPITrack>>(accessToken, url)
        
    if (!tracksPayload) return null

    const topTracks = tracksPayload.items.map((track: SpotifyAPITrack) => ({
        id: track.id,
        name: track.name,
        durationMs: track.duration_ms,
        artists: track.artists.map((artist: SpotifyArtist) => ({
            id: artist.id,
            name: artist.name,
        })),
        album: {
            id: track.album.id,
            name: track.album.name,
            releaseDate: track.album.release_date,
            totalTracks: track.album.total_tracks,
            images: track.album.images
        },
        isrc: track.external_ids.isrc
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
        name: artist.name,
        images: artist.images
    }))
    return topArtists
}

