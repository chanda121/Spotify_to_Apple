import express from 'express'
import { getToken, saveToken, unsaveToken } from '../../services/apple/authService.js'

const router = express.Router()

router.get('/dev-token', getToken)

router.post('/save-token', saveToken)

router.get('/logout', unsaveToken)

export default router