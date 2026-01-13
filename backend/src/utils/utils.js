const refresh_token = async (req) => {
    const refresh_token = req.session.spotify_token ? req.session.spotify_token.refresh_token : null

    try {
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: process.env.SPOTIFY_CLIENT_ID,
                grant_type: 'refresh_token',
                refresh_token: refresh_token
            })
        })

        const data = await tokenResponse.json()
        if (data.error) return false
        
        req.session.spotify_token = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
            expires_datetime: Date.now() + data.expires_in*1000
        }
        
        return true
    } catch (error) {
        console.error('Token refresh error:', error)
        return false
    }

}

module.exports = { refresh_token }