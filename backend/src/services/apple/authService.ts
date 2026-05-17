import createError from 'http-errors'
import { getStorefront } from '../apple/userService.js'
import { createJWT } from '../../utils/crypto.js';
import type { Request, Response } from 'express';

const keyId = process.env.APPLE_KID
const teamId = process.env.APPLE_TEAM_ID

//60 sec/min * 60 min/hr * 24 hr/day * 30 days/month * 2 months
const TOKEN_EXPIRY = 60 * 60 * 24 * 30 * 2 //2 months in seconds

const getDeveloperToken = () => {
    const timeInSec = Math.floor(Date.now() / 1000) - 10
    const expInSec = timeInSec + TOKEN_EXPIRY 

    if(!keyId) throw createError(500, 'Internal Server Error: Apple Key ID is missing from environment.')
    if(!teamId) throw createError(500, 'Internal Server Error: Apple Team ID is missing from environment.')

    const header = {
        'alg': 'ES256',
        'kid': keyId,
        'typ': 'JWT'
    }
    const claims = {
        'iss': teamId,
        'iat': timeInSec,
        'exp': expInSec,
    }

    return createJWT(header, claims)
}

export const getDevToken = async (req: Request, res: Response) => {
    const devToken = getDeveloperToken()
    req.session.appleDevToken = devToken
    res.json({
        devToken
    })
}

export const saveToken = async (req: Request, res: Response) => {
    const mut = req.body?.musicUserToken
    if (!mut) throw createError(400, 'Invalid Music Token')
    req.session.appleMusicUserToken = mut

    const devToken = req.session.appleDevToken
    if (!devToken) throw createError(401, 'Missing Apple Developer Token')

    const storefront = await getStorefront(devToken, mut)
    if (!storefront) throw createError(502, 'Unexpected storefront response from Apple')

    req.session.appleStorefront = storefront

    res.json({ ok: true })
}

export const unsaveToken = async (req: Request, res: Response) => {
    req.session.appleMusicUserToken = undefined
    req.session.appleDevToken = undefined
    req.session.appleStorefront = undefined

    res.json({ ok: true })
}