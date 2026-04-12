import { createJWT } from '../../utils/crypto.js';
import type { Request, Response } from 'express';

const keyId = process.env.APPLE_KID
const teamId = process.env.APPLE_TEAM_ID
const origin = [ process.env.BACKEND_URL ]

//60 sec/min * 60 min/hr * 24 hr/day * 30 days/month * 2 months
const TOKEN_EXPIRY = 60 * 60 * 24 * 30 * 2 //2 months in seconds

const getDeveloperToken = () => {
    const timeInSec = Math.floor(Date.now() / 1000) - 10
    const expInSec = timeInSec + TOKEN_EXPIRY 

    if(!keyId) throw new Error('Internal Server Error: Apple Key ID is missing from environment.')
    if(!teamId) throw new Error('Internal Server Error: Apple Team ID is missing from environment.')
    if(!origin) throw new Error('Internal Server Error: origins is missing from environment.')


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

export const getToken = async (req: Request, res: Response) => {
    const devToken = getDeveloperToken()
    req.session.appleDevToken = devToken
    res.json({
        devToken
    })
}

export const saveToken = (req: Request, res: Response) => {
    if(!req.body) {        
        return res.status(500).json({
            error: {
                message: 'invalid music token...'
            }
        })}
    const mutData = req.body

    console.log(mutData)
    
    req.session.appleMusicUserToken = mutData.musicUserToken
    
    res.json({ ok: true })
}