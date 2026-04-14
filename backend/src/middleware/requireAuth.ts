import createError from 'http-errors'
import { checkAccessToken } from '../services/spotify/authService.js'
import type { Request, Response, NextFunction } from 'express'

export const requireSpotifyAuth = async (req: Request, _res: Response, next: NextFunction) => {
    if (!await checkAccessToken(req)) {
        throw createError(401, `401 error, Invalid or missing access token`)
    }
    next()
}

export const requireAppleAuth = async (req: Request, _res: Response, next: NextFunction) => {
    if(!req.session.appleDevToken || !req.session.appleMusicUserToken) {
        throw createError(401, `401 error, Invalid or missing dev or apple music user token`)
    }
    next()
}