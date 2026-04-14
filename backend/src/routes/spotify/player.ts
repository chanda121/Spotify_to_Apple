import express from 'express'
import createError from 'http-errors'
import { getCurrentlyPlaying } from '../../services/spotify/playerService.js'
import { requireSpotifyAuth } from '../../middleware/requireAuth.js'

import type { Request, Response } from 'express'

const router = express.Router()

router.get('/get-current-track', requireSpotifyAuth, async (req: Request, res: Response) => {
    const accessToken = req.session.spotifyToken?.accessToken
    if (!accessToken) throw createError(401, 'Missing access token')

    const data = await getCurrentlyPlaying(accessToken)
    if (!data) throw createError(502, 'Unexpected empty response from Spotify')

    return res.json(data)
})

export default router