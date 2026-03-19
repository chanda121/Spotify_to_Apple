
import type { Request, Response as ExpressResponse } from 'express'

export const fetchWithAuth =  async <T>({req, res, url, onSuccess}:
    {
        req: Request
        res: ExpressResponse
        url: string
        onSuccess: (data: T | null) => ExpressResponse
    }): Promise<ExpressResponse | void> => {

        const accessToken = req.session.spotify_token?.accessToken

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            })
            if (response.status === 204) {
                return onSuccess(null)
            }

            if (!await checkAPIResponse(response, res)) return

            const data = await response.json() as T
            return onSuccess(data)
        } catch (error) {
            console.error('fetchWithAuth error:', error)
            return res.status(500).json({ 
                error: {
                    message: 'Internal Server Error'
                }
            })
        }
    }

/**
 * 
 * @param fetchRes fetch API response object
 * @param expressRes ExpressResponse object
 * @returns true if response is ok, false if response not ok
 */
export const checkAPIResponse = async (fetchRes: Response, expressRes: ExpressResponse): Promise<boolean> => {
    if (!fetchRes.ok) {
        const text = await fetchRes.text().catch(() => '')
        console.error('Spotify error:', fetchRes.status, text)
        expressRes.status(fetchRes.status).json({
            error: {
                message: 'Spotify API error...'
            }
        })
        return false
    }
    return true
}