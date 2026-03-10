import express from 'express'
import type { Request, Response } from 'express'
import crypto from 'crypto'
import { SpotifyToken, SpotifyTokenError } from '@shared/types/spotify.js'
import { refresh_token, check_access_token } from '../utils/utils.js'



const router = express.Router()

const client_id = process.env.SPOTIFY_CLIENT_ID

const redirect_auth_uri = process.env.SPOTIFY_REDIRECT_URI
/*
    req.session.<x>
    x = generatedState: state for authorization check
    x = codeVerifier: PKCE authorization workflow
    
    req.session.spotify_token = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        expires_datetime: (Date.now()+data.expires_in*1000
    }
*/

const base64URLEncode = (str: Buffer): string => {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
const generateRandomString = (length: number): string => {
    return base64URLEncode(crypto.randomBytes(length)).slice(0, length)
}
const generateCodeChallenge = (verifier: string): string => {
  const hashed = crypto.createHash('sha256').update(verifier).digest()
  return base64URLEncode(hashed);
}

router.get('/', (req: Request, res: Response) => {
    req.session.generatedState = generateRandomString(16)
    req.session.codeVerifier = generateRandomString(64)
    const codeChallenge = generateCodeChallenge(req.session.codeVerifier)

    const scope = `user-read-private user-read-email user-read-currently-playing user-library-read user-top-read
                 playlist-read-private playlist-read-collaborative playlist-modify-private`

    const params = new URLSearchParams({
        client_id: client_id ?? '',
        response_type: 'code',
        redirect_uri: redirect_auth_uri ?? '',
        state: req.session.generatedState,
        scope: scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge
    })

    return res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`)
})

router.get('/callback', async (req: Request, res: Response)  => {
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
                redirect_uri: redirect_auth_uri ?? '',
                client_id: client_id ?? '',
                code_verifier: req.session.codeVerifier ?? ''
            })
        })

        if (!tokenResponse.ok) {
            const errorParams = new URLSearchParams({ error: 'token_fetch_failed' })
            return res.redirect(`/?${errorParams.toString()}`)
        }

        const data = await tokenResponse.json() as SpotifyToken | SpotifyTokenError

        if ('error' in data) {
            const errorParams = new URLSearchParams({ error: data.error })
            return res.redirect(`/?${errorParams.toString()}`)
        }
        
        req.session.spotify_token = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
            expires_datetime: Date.now() + data.expires_in * 1000
        }

        delete req.session.generatedState
        delete req.session.codeVerifier

        return res.redirect(process.env.FRONTEND_URL ?? 'http://127.0.0.1:5173/')
    } catch (error) {
        console.error('Token exchange error:', error)
        return res.status(500).json({ error: 'Failed to exchange token' })
    }
})

router.get('/refresh_token', async (req: Request, res: Response) => {
    const success = await refresh_token(req)

    if (!success) {
        return res.status(401).json({ ok: false })
    }
    return res.redirect(process.env.FRONTEND_URL ?? 'http://127.0.0.1:5173/')
})

router.get('/token', async (req: Request, res: Response) => {
    if (!await check_access_token(req)) {
        return res.status(401).json({ access_token: null, error: 'not_authenticated' })
    }
    
    return res.json({ access_token: req.session.spotify_token?.access_token })
})

router.get('/logout', (req: Request, res: Response) => {
    delete req.session.spotify_token
    delete req.session.generatedState
    delete req.session.codeVerifier

    return res.redirect('http://127.0.0.1:5173/')
})

export default router