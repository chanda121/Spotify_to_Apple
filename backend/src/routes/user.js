require('dotenv').config();
const express = require('express')
const crypto = require('crypto')

const router = express.Router()

const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const redirect_auth_uri = 'http://127.0.0.1:3000/api/user/callback'

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256 = (bufferOrString) => {
    return crypto.createHash('sha256').update(bufferOrString).digest()
}

const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
}

router.get('/auth', async (req, res) => {
    req.session.generatedState = generateRandomString(16)
    req.session.codeVerifier = generateRandomString(64)
    const hashed = sha256(req.session.codeVerifier)
    const codeChallenge = base64encode(hashed)
    console.log(`code verifier: `)

    const scope = `user-read-private user-read-email user-read-playback-state user-modify-playback-state 
                 user-read-currently-playing streaming user-top-read user-read-playback-position playlist-read-private`

    const params = new URLSearchParams({
        client_id: client_id,
        response_type: 'code',
        redirect_uri: redirect_auth_uri,
        state: req.session.generatedState,
        scope: scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge
    })

    res.redirect('https://accounts.spotify.com/authorize?' + params.toString())
})

router.get('/callback', async (req, res) => {
    const code = req.query.code || null
    const state = req.query.state || null
    const err = req.query.error || null

    console.log(`Got code and state: ${code} and ${state}`)
    console.log(`looking at express session data:\ngeneratedState:${req.session.generatedState}\ncodeVerifier:${req.session.codeVerifier}`)

    if (state === null || state != req.session.generatedState) {
        const errorParams = new URLSearchParams({ error: 'state_mismatch' })
        return res.redirect('/?' + errorParams.toString())
    }

    if (err != null) {
        const errorParams = new URLSearchParams({ error: err })
        return res.redirect('/?' + errorParams.toString())
    }

    try {
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_auth_uri,
                client_id: client_id,
                code_verifier: req.session.codeVerifier
            })
        })

        const data = await tokenResponse.json()

        if (data.error) {
            const errorParams = new URLSearchParams({ error: data.error })
            return res.redirect('/?' + errorParams.toString())
        }

        res.json(data)
    } catch (error) {
        console.error('Token exchange error:', error)
        res.status(500).json({ error: 'Failed to exchange token' })
    }
})


router.get('/', (req, res) => {
    res.json({'message': 'user info from here...'})
})

module.exports = router