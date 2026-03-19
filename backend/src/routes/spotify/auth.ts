import express from 'express'
import { getToken, handleCallback, logout } from '../../services/spotify/authService.js'

const router = express.Router()

router.get('/', getToken)

router.get('/callback', handleCallback)

router.get('/logout', logout)

export default router