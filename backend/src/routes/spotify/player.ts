import express from 'express'
import { getCurrentlyPlaying } from '../../services/spotify/playerService.js'
import { requireAuth } from '../../middleware/requireAuth.js'


const router = express.Router()

router.get('/get-current-track', requireAuth, getCurrentlyPlaying)

export default router