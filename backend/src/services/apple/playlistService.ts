import { fetchWithAppleAuth } from '../AppleAPIClient.js'
import type { Request, Response } from 'express'
import type { AppleMusicAPIResponse, AppleMusicResource, ApplePlaylistAttribute } from '@shared/types/apple.js'


export const getPlaylists = async (devToken: string, mut: string) => {
    const url = 'https://api.music.apple.com/v1/me/library/playlists'
    const data = await fetchWithAppleAuth<AppleMusicAPIResponse<AppleMusicResource<ApplePlaylistAttribute>>>(devToken, mut, url)

    console.log(data)
    if (!data) return null
    return data
}

export const getLikedSongs = (req: Request, res: Response) => {

}

export const getPlaylistTracks = async (req: Request, res: Response) => {
    const href = req.body.tracksHref

    
}