import type { Request } from 'express'
import type { SpotifyAPIToken, SpotifyTokenError } from '@shared/types/spotify.js'

const BUFFER = 60000 //60 second buffer


export const refreshToken = async (req: Request): Promise<boolean> => {
    const refreshTokenVal = req.session.spotify_token ? req.session.spotify_token.refreshToken : null

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
                'Content-type': 'application/x-www-form-urlencoded'
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
        
        req.session.spotify_token = {
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
    if (!req.session.spotify_token) return false

    if (Date.now() > req.session.spotify_token.expiresDatetime - BUFFER) {
        const success = await refreshToken(req)

        return success
    }
    return true
}
