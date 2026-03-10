import type { Request } from "express"
import type { SpotifyToken, SpotifyTokenError } from "../../../shared/src/types/spotify.js"

const BUFFER = 60000 //60 second buffer


export const refresh_token = async (req: Request): Promise<boolean> => {
    const refreshTokenVal = req.session.spotify_token ? req.session.spotify_token.refresh_token : null

    try {
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: process.env.SPOTIFY_CLIENT_ID ?? '',
                grant_type: 'refresh_token',
                refresh_token: refreshTokenVal ?? ''
            })
        })
        
        if (!tokenResponse.ok) {
            const text = await tokenResponse.text().catch(() => '')
            console.error('Token refresh failed: ',  tokenResponse.status, text)
            return false
        }

        const data = await tokenResponse.json() as SpotifyToken | SpotifyTokenError

        if ('error' in data) return false
        
        req.session.spotify_token = {
            access_token: data.access_token,
            refresh_token: data.refresh_token ?? refreshTokenVal ?? '',
            expires_in: data.expires_in,
            expires_datetime: Date.now() + data.expires_in * 1000
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
export const check_access_token = async (req: Request): Promise<boolean> => {
    if (!req.session.spotify_token) return false

    if (Date.now() > req.session.spotify_token.expires_datetime - BUFFER) {
        const success = await refresh_token(req)

        return success
    }
    return true
}
