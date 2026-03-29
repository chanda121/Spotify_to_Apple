import type { Request, Response } from 'express'
import type { AppleMusicAPIResponse, AppleMusicResource, ApplePlaylistAttribute } from '@shared/types/apple.js'

const fetchWithAppleAuth = async <T>({req, res, url, onSuccess}:
    {
        req: Request
        res: Response
        url: string
        onSuccess: (data: T | null) => Response
    }): Promise<Response | void>  => {
        const devToken = req.session.appleDevToken
        const mut = req.session.appleMusicUserToken



        try {
            if(!devToken || !mut) {
                throw new Error('Dev token or Music User Token undefined')
            }
            const response = await fetch(url, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${devToken}`,
                    'Music-User-Token': mut
                }
            })

            if (!response.ok) {
                const text = await response.text().catch(() => '')
                console.error('Apple error:', response.status, text)
                return res.status(response.status).json({
                    error: {
                        message: 'Apple API error...'
                    }
                })
            }

            const data = await response.json() as T
            return onSuccess(data)
        } catch (error) {
            console.error('fetchWithAuth (apple) error: ', error)
            return res.status(500).json({
                error: {
                    message: 'Internal Server Error'
                }
            })
        }

}

export const getPlaylists = async (req: Request, res: Response) => {
    await fetchWithAppleAuth<AppleMusicAPIResponse<AppleMusicResource<ApplePlaylistAttribute>>>({
        req,
        res,
        url: 'https://api.music.apple.com/v1/me/library/playlists',
        onSuccess: (data) => {
            console.log(data)
            if (!data) {
                return res.status(204).send()
            }
            return res.json(data)
        }
    })
}

export const getLikedSongs = (req: Request, res: Response) => {

}

export const getPlaylistTracks = async (req: Request, res: Response) => {
    const href = req.body.tracksHref

    
}