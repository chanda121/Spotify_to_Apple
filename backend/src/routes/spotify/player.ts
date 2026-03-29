import express from 'express'
import { getCurrentlyPlaying } from '../../services/spotify/playerService.js'
import { requireSpotifyAuth } from '../../middleware/requireAuth.js'


const router = express.Router()

router.get('/get-current-track', requireSpotifyAuth, getCurrentlyPlaying)

export default router