const express = require('express')
const createError = require('http-errors')

const { refreshToken } = require('../utils/utils')

const router = express.Router()

router.get('/session', (req, res) => {
    if (req.session.spotify_token) {
        res.json({logged_in: true})

    } else {
        res.json({logged_in: false})
    }
})

router.get('/email', async (req, res) => {
    if (!req.session.spotify_token) {
        throw createError(401)
    }
    if (Date.now() > req.session.spotify_token.expires_datetime) {
        success = await refreshToken(req)
        if (!success) {
            return res.status(401).json({ ok: false })
        }
    }
    access_token = req.session.spotify_token.access_token


    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${access_token}` }
        })

        const data = await response.json()
        
        res.json(data)
    } catch (error) {
        console.error('get email error: ', error)
        return res.status(500).json({ error: 'Failed to get email'})
    }
    
})

module.exports = router