import express from 'express'
import createError from 'http-errors'
import { createPlaylist, getPlaylists } from '../../services/apple/playlistService.js'
import { requireAppleAuth } from '../../middleware/requireAuth.js'
import { matchTracks } from '../../services/apple/transferService.js'
import type { Request, Response } from 'express'

const router = express.Router()

router.get('/all', requireAppleAuth, async (req: Request, res: Response) => {
    const devToken = req.session.appleDevToken
    const mut = req.session.appleMusicUserToken

    if (!devToken || !mut) throw createError(401, 'Missing credentials')

    const data = await getPlaylists(devToken, mut)
    return res.json(data)
})

router.post('/matchTracks', requireAppleAuth, async (req: Request, res: Response) => {
    const devToken = req.session.appleDevToken
    const mut = req.session.appleMusicUserToken
    const storefront = req.session.appleStorefront ?? 'us'
    const transferTracks = req.body.transferTracks

    if (!devToken || !mut) throw createError(401, 'Missing credentials')

    const data = await matchTracks(devToken, mut, storefront, transferTracks)
    return res.json(data)
})

router.post('/create-playlist', requireAppleAuth, async (req: Request, res: Response) => {
    const devToken = req.session.appleDevToken
    const mut = req.session.appleMusicUserToken
    const storefront = req.session.appleStorefront ?? 'us'
    const transferPlaylist = req.body.transferPlaylist

    if (!devToken || !mut) throw createError(401, 'Missing credentials')
    
    const data = await createPlaylist(devToken, mut, storefront, transferPlaylist)

    return res.json(data)
    
})

export default router