const express = require('express')

const { check_access_token } = require('../utils/utils')

const router = express.Router()

router.put('/transfer-playback', async (req, res) => {
    if (!await check_access_token(req)) {
        return res.status(401).json({ ok: false })
    }
    const access_token = req.session.spotify_token.access_token

    const device_id = req.query.device_id
    const play = req.query.play === 'true'

    try {
        const response = await fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                device_ids: [device_id],
                play: play
            })
        })

        if (response.status === 204) {
            return res.json({ ok: true })
        }
        
        const data = await response.json()
        console.log(data)
        res.status(response.status).json(data)
    } catch (error) {
        console.error(`transfer playback error: ${error}`)
        return res.status(500).json({ error: 'Failed to transfer playback'})
    }
})

router.get('/get_playback_state', async (req, res) => {
    if (!await check_access_token(req)) {
        return res.status(401).json({ ok: false })
    }
    const access_token = req.session.spotify_token.access_token

    try {
        const response = await fetch('https://api.spotify.com/v1/me/player', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${access_token}`},
        })

        const data = await response.json()

        playbackState = {
            device_id: data.device.id,
            volume_percent: data.device.volume_percent,
            shuffle_state: data.shuffle_state,
            smart_shuffle: data.smart_shuffle,
            repeat_state: data.repeat_state,
            progress_ms: data.progress_ms,
            
        }
        console.log(data)
        console.log(structured_data)
        res.json(structured_data)
    } catch (error) {
        console.log(`get playback state error: ${error}`)
        return res.status(500).json({ error: 'Failed to get playback state'})
    }
})

module.exports = router