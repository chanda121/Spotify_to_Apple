import express from 'express'
import createError from 'http-errors'
import { getPlaylists } from '../../services/apple/playlistService.js'
import { transferPlaylists } from '../../services/apple/transferService.js'
import { requireAppleAuth, requireSpotifyAuth } from '../../middleware/requireAuth.js'
import type { Request, Response } from 'express'
import type { TransferPlaylistInput } from '@shared/types/spotify.js'

const router = express.Router()

router.get('/all', requireAppleAuth, async (req: Request, res: Response) => {
    const devToken = req.session.appleDevToken
    const mut = req.session.appleMusicUserToken

    if (!devToken || !mut) throw createError(401, 'Missing credentials')

    const data = await getPlaylists(devToken, mut)
    return res.json(data)
})

router.post('/create-playlists', requireAppleAuth, requireSpotifyAuth, async (req: Request, res: Response) => {
    const spotifyAccessToken = req.session.spotifyToken?.accessToken
    const devToken = req.session.appleDevToken
    const mut = req.session.appleMusicUserToken
    const storefront = req.session.appleStorefront ?? 'us'
    const playlistsToTransfer = parseTransferRequest(req.body)

    if (!devToken || !mut) throw createError(401, 'Missing credentials')
    if (!spotifyAccessToken) throw createError(400, 'Missing Spotify Token')

    const data = await transferPlaylists(devToken, mut, storefront, spotifyAccessToken, playlistsToTransfer)

    return res.json(data)
})

const parseTransferRequest = (body: unknown): TransferPlaylistInput[] => {
    if (!body || typeof body !== 'object') throw createError(400, 'Invalid body')
    const raw = (body as any).transferPlaylists
    if (!Array.isArray(raw)) throw createError(400, 'transferPlaylists must be an array')
    if (raw.length === 0) throw createError(400, 'At least one playlist required')
    if (raw.length > 5) throw createError(400, 'Passed more than 5 playlists')

    const parsed: TransferPlaylistInput[] = []
    for (const item of raw) {
        if (typeof item?.id !== 'string' || item.id.length === 0) throw createError(400, 'A playlist id seems off...')
        if (typeof item?.name !== 'string' || item.name.length > 200) throw createError(400, 'Playlist name over 200 characters')
        if (item.description || typeof item.description === 'string') {
            if (item.description.length > 500) throw createError(400, 'Playlist description over 500 characters')
        }
        parsed.push({id: item.id, name: item.name, description: item.description ?? ''})
    }

    return [...new Map(parsed.map(p => [p.id, p])).values()] //dedupe

}

export default router