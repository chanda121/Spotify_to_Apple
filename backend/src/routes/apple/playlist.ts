import express from 'express'
import { getPlaylists, getLikedSongs } from '../../services/apple/playlistService.js'
import { requireAppleAuth } from '../../middleware/requireAuth.js'
import type { Request, Response } from 'express'
import createError from 'http-errors'

const router = express.Router()

router.get('/all', requireAppleAuth, async (req: Request, res: Response) => {
    const devToken = req.session.appleDevToken
    const mut = req.session.appleMusicUserToken

    if(!devToken || !mut) throw createError(401, 'Missing credentials')

    return await getPlaylists(devToken, mut)
})

router.get('/liked-songs', requireAppleAuth, getLikedSongs)

export default router