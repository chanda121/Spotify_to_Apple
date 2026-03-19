import { checkAccessToken } from '../services/spotify/authService.js'
import type { Request, Response, NextFunction } from 'express'

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
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