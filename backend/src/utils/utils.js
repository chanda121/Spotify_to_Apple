
const refresh_token = async (req) => {
    const refreshTokenVal = req.session.spotify_token ? req.session.spotify_token.refresh_token : null

    try {
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: process.env.SPOTIFY_CLIENT_ID,
                grant_type: 'refresh_token',
                refresh_token: refreshTokenVal
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

/**
 * Check if access token exists/expired
 * refreshes token if expired
 * @param {*} req 
 * 
 * returns false if no token exists or token can't be refreshed, true otherwise
 */
const check_access_token = async (req) => {
    if (!req.session.spotify_token) {
        return false
    }
    if (Date.now() > req.session.spotify_token.expires_datetime) {
        const success = await refresh_token(req)
        if (!success) {
            return false
        }
    }
    return true
}

module.exports = { refresh_token, check_access_token }