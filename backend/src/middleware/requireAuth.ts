import { checkAccessToken } from '../services/spotify/authService.js'
import type { Request, Response, NextFunction } from 'express'

export const requireSpotifyAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (!await checkAccessToken(req)) {
        console.error(`401 error, unauthorized access`)
        return res.status(401).json({ 
            error: {
                message: 'Invalid or missing access token...'
            }
            })
    }
    next()
}

export const requireAppleAuth = async (req: Request, res: Response, next: NextFunction) => {
    if(!req.session.appleDevToken || !req.session.appleMusicUserToken) {
        console.error(`401 error, unauthorized access`)
        return res.status(401).json({
            error: {
                message: 'Invalid or missing dev or apple music user token'
            }
        })
    }
    next()
}