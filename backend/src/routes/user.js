const express = require('express')
const crypto = require('crypto')

const router = express.Router()

const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET

const redirect_auth_uri = 'http://127.0.0.1:5173/api/user/callback'

const base64URLEncode = (str) =>{
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
const generateRandomString = (length) => {
    return base64URLEncode(crypto.randomBytes(length)).slice(0, length)
}
const sha256 = (buffer) => {
    return crypto.createHash('sha256').update(buffer).digest()
}
const generateCodeChallenge = (verifier) => {
  const hashed = sha256(verifier);
  return base64URLEncode(hashed);
}

router.get('/auth', async (req, res) => {
    req.session.generatedState = generateRandomString(16)
    req.session.codeVerifier = generateRandomString(64)
    const codeChallenge = generateCodeChallenge(req.session.codeVerifier)
    console.log(`generated state: ${req.session.generatedState}`)
    console.log(`code verifier: ${req.session.codeVerifier}`)

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