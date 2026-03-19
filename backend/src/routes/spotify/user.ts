import express from 'express'
import { getSession, getUserInfo, getTopArtists, getTopTracks } from '../../services/spotify/userService.js'
import { getPlaylists, getSavedSongs } from '../../services/spotify/playlistService.js'
import { requireAuth } from '../../middleware/requireAuth.js'

const router = express.Router()

router.get('/session', getSession)

router.get('/user-info', requireAuth, getUserInfo)

router.get('/top-tracks', requireAuth, getTopTracks)

router.get('/top-artists', requireAuth, getTopArtists)

router.get('/playlists', requireAuth, getPlaylists)

router.get('/saved-songs', requireAuth, getSavedSongs)

export default router