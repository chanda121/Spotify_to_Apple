import express from 'express'
import { getPlaylists, getLikedSongs } from '../../services/apple/userService.js'

const router = express.Router()

router.get('/playlists', getPlaylists)

router.get('/liked-songs', getLikedSongs)

export default router