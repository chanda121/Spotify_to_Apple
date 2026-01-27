const express = require('express')

const { check_access_token } = require('../utils/utils')

const router = express.Router()

router.get('/session', async (req, res) => {
    if (req.session.spotify_token && await check_access_token(req)) {
        res.json({logged_in: true})

    } else {
        res.json({logged_in: false})
    }
})

router.get('/user-info', async (req, res) => {
    if (!await check_access_token(req)) {
        return res.status(401).json({ ok: false })
    }
    const access_token = req.session.spotify_token.access_token

    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${access_token}` }
        })

        const data = await response.json()

        const user = {
            userId: data.id,
            email: data.email,
            display_name: data.display_name,
            images: data.images ?? [],
            country: data.country,
            product: data.product,
        }
        res.json(user)
    } catch (error) {
        console.error(`get email error: ${error}`)
        return res.status(500).json({ error: 'Failed to get email'})
    }
    
})

router.get('/top-tracks', async (req, res) => {
    if (!await check_access_token(req)) {
        return res.status(401).json({ ok: false })
    }
    const access_token = req.session.spotify_token.access_token
    const time_range = req.query.time_range || 'short_term'
    const limit = Number(req.query.limit) || 20
    const offset = Number(req.query.offset) || 0

    try {
        const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${time_range}&limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${access_token}` }
        })

        const data = await response.json()
        const tracks = data.items.map((track) => ({
            id: track.id,
            uri: track.uri,
            name: track.name,
            duration_ms: track.duration_ms,
            artists: track.artists.map((artist) => ({
                id: artist.id,
                uri: artist.uri,
                name: artist.name,
            })),
            album: {
                id: track.album.id,
                uri: track.album.uri,
                name: track.album.name,
                release_date: track.album.release_date,
                total_tracks: track.album.total_tracks
            }
        }))
        
        res.json(tracks)
    } catch (error) {
        console.error(`get query error (top tracks): ${error}`)
        return res.status(500).json({ error: 'Failed to get query'})
    }
})

router.get('/top-artists', async (req, res) => {
    if (!await check_access_token(req)) {
        return res.status(401).json({ ok: false })
    }
    const access_token = req.session.spotify_token.access_token
    const time_range = req.query.time_range || 'short_term'
    const limit = Number(req.query.limit) || 20
    const offset = Number(req.query.offset) || 0
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${time_range}&limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${access_token}` }
        })

        const data = await response.json()

        const artists = data.items.map((artist) => ({
            id: artist.id,
            uri: artist.uri,
            name: artist.name,
            images: artist.images?.map((image) => ({
                url: image.url,
                height: image.height,
                width: image.width
            }))
        }))
        
        res.json(artists)
    } catch (error) {
        console.error(`get query error (top artists): ${error}`)
        return res.status(500).json({ error: 'Failed to get query'})
    }
})

router.get('/:id/playlists', async (req, res) => {
    if (!await check_access_token(req)) {
        return res.status(401).json({ ok: false })
    }
    const access_token = req.session.spotify_token.access_token
    const userId = req.params.id
    const limit = Number(req.query.limit) || 50
    const offset = Number(req.query.offset) || 0
    try {
        let response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${access_token}` }
        })

        let initData = await response.json()
        let jsonResponse = initData.items

        while (initData.next) {
            response = await fetch(initData.next, {
                method: 'GET', headers: { 'Authorization': `Bearer ${access_token}` }
            })
            initData = await response.json()
            jsonResponse = jsonResponse.concat(initData.items)
        }

        jsonResponse = jsonResponse.map((playlist) => ({
                id: playlist.id,
                uri: playlist.uri,
                name: playlist.name,
                ownerId: playlist.owner.id,
                tracksHref: playlist.tracks.href
            }))

        res.json(jsonResponse)
    } catch (error) {
        console.error(`get query error (playlists): ${error}`)
        return res.status(500).json({ error: 'Failed to get query'})
    }
})

router.get('/saved-songs', async (req, res) => {
    if (!await check_access_token(req)) {
        return res.status(401).json({ ok: false })
    }
    const access_token = req.session.spotify_token.access_token

    const limit = Number(req.query.limit) || 20
    const offset = Number(req.query.offset) || 0
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${access_token}` }
        })

        const data = await response.json()

        res.json(data)
    } catch (error) {
        console.error(`get query error (playlists): ${error}`)
        return res.status(500).json({ error: 'Failed to get query'})
    }
})

module.exports = router