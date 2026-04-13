import express from 'express'
import { getSession, getUserInfo, getTopArtists, getTopTracks } from '../../services/spotify/userService.js'
import { getPlaylists, getLikedSongs, getPlaylistTracks } from '../../services/spotify/playlistService.js'
import { requireSpotifyAuth } from '../../middleware/requireAuth.js'

const router = express.Router()

router.get('/session', getSession)

router.get('/user-info', requireSpotifyAuth, getUserInfo)

router.get('/top-tracks', requireSpotifyAuth, getTopTracks)

router.get('/top-artists', requireSpotifyAuth, getTopArtists)

router.get('/playlists', requireSpotifyAuth, getPlaylists)

router.get('/playlists/:id', requireSpotifyAuth, getPlaylistTracks)

router.get('/liked-songs', requireSpotifyAuth, getLikedSongs)

export default router