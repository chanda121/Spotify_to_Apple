import express from 'express'
import { getPlaylists, getLikedSongs } from '../../services/apple/playlistService.js'
import { requireAppleAuth } from '../../middleware/requireAuth.js'

const router = express.Router()

router.get('/all', requireAppleAuth, getPlaylists)

router.get('/liked-songs', requireAppleAuth, getLikedSongs)

export default router