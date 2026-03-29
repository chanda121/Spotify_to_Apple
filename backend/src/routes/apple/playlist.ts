import express from 'express'
import { getPlaylists, getLikedSongs } from '../../services/apple/playlistService.js'

const router = express.Router()

router.get('/all', getPlaylists)

router.get('/liked-songs', getLikedSongs)

export default router