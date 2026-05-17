import express from 'express'
import { getDevToken, saveToken, unsaveToken } from '../../services/apple/authService.js'

const router = express.Router()

router.get('/dev-token', getDevToken)

router.post('/save-token', saveToken)

router.get('/logout', unsaveToken)

export default router