import express from 'express'
import { getDevToken, isLinked, saveMut, unsaveToken } from '../../services/apple/authService.js'

const router = express.Router()

router.get('/is-linked', isLinked)

router.get('/dev-token', getDevToken)

router.post('/save-token', saveMut)

router.get('/logout', unsaveToken)

export default router