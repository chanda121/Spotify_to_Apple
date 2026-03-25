import { generateRandomString, generateCodeChallenge } from '../../utils/crypto.js'
import type { Request, Response } from 'express'
import type { SpotifyAPIToken, SpotifyTokenError } from '@shared/types/spotify.js'

const BUFFER = 60000 //60 second buffer

const clientId = process.env.SPOTIFY_CLIENT_ID
const redirectAuthUri = process.env.SPOTIFY_REDIRECT_URI

export const refreshToken = async (req: Request): Promise<boolean> => {
    const refreshTokenVal = req.session.spotifyToken ? req.session.spotifyToken.refreshToken : null

    try {
        if (!refreshTokenVal) {
            throw new Error('No refresh token found in session...')
        }
        if (!process.env.SPOTIFY_CLIENT_ID) {
            throw new Error('Missing SPOTIFY_CLIENT_ID')
        }

        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: process.env.SPOTIFY_CLIENT_ID,
                grant_type: 'refresh_token',
                refresh_token: refreshTokenVal
            })
        })
        
        if (!tokenResponse.ok) {
            const text = await tokenResponse.text().catch(() => '')
            console.error('Token refresh failed: ',  tokenResponse.status, text)
            return false
        }

        const data = await tokenResponse.json() as SpotifyAPIToken | SpotifyTokenError

        if ('error' in data) return false
        
        req.session.spotifyToken = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token ?? refreshTokenVal ?? '',
            expiresIn: data.expires_in,
            expiresDatetime: Date.now() + data.expires_in * 1000
        }
        
        return true
    } catch (error) {
        console.error('Token refresh error:', error)
        return false
    }

}

/**
 * Returns true if a valid Spotify access token exists.
 * Refreshes the token if expired.
 * Returns false if no token exists or refresh fails.
 */
export const checkAccessToken = async (req: Request): Promise<boolean> => {
    if (!req.session.spotifyToken) return false

    if (Date.now() > req.session.spotifyToken.expiresDatetime - BUFFER) {
        const success = await refreshToken(req)

        return success
    }
    return true
}

export const getToken = (req: Request, res: Response) => {
    req.session.generatedState = generateRandomString(16)
    req.session.codeVerifier = generateRandomString(64)
    const codeChallenge = generateCodeChallenge(req.session.codeVerifier)

    const scope = `user-read-private user-read-email user-read-currently-playing user-library-read user-top-read
                 playlist-read-private playlist-read-collaborative playlist-modify-private`

    const params = new URLSearchParams({
        client_id: clientId ?? '',
        response_type: 'code',
        redirect_uri: redirectAuthUri ?? '',
        state: req.session.generatedState,
        scope: scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge
    })

    return res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`)
}

export const handleCallback = async (req: Request, res: Response)  => {
    const code = (req.query.code as string) || ''
    const state = (req.query.state as string) || null
    const err = (req.query.error as string) || null

    if (state === null || state !== req.session.generatedState) {
        const errorParams = new URLSearchParams({ error: 'state_mismatch' })
        return res.redirect(`/?${errorParams.toString()}`)
    }

    if (err != null) {
        const errorParams = new URLSearchParams({ error: err })
        return res.redirect(`/?${errorParams.toString()}`)
    }

    try {
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectAuthUri ?? '',
                client_id: clientId ?? '',
                code_verifier: req.session.codeVerifier ?? ''
            })
        })

        if (!tokenResponse.ok) {
            const errorParams = new URLSearchParams({ error: 'token_fetch_failed' })
            return res.redirect(`/?${errorParams.toString()}`)
        }

        const data = await tokenResponse.json() as SpotifyAPIToken | SpotifyTokenError

        if ('error' in data) {
            const errorParams = new URLSearchParams({ error: data.error })
            return res.redirect(`/?${errorParams.toString()}`)
        }
        
        req.session.spotifyToken = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
            expiresDatetime: Date.now() + data.expires_in * 1000
        }

        delete req.session.generatedState
        delete req.session.codeVerifier

        return res.redirect(process.env.FRONTEND_URL ?? 'http://127.0.0.1:5173/')
    } catch (error) {
        console.error('Error getting token', error)
        return res.status(500).json({ 
            error: {
                message: 'Failed to get Spotify Token' 
            }
        })
    }
}

export const logout = (req: Request, res: Response) => {
    delete req.session.spotifyToken
    delete req.session.generatedState
    delete req.session.codeVerifier

    return res.redirect(process.env.FRONTEND_URL ?? 'http://127.0.0.1:5173/')
}