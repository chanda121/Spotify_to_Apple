import express from 'express'
import { getToken, saveToken } from '../../services/apple/authService'

const router = express.Router()

router.get('/dev-token', getToken)

router.post('/save-token', saveToken)

export default router