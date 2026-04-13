
import type { Request, Response as ExpressResponse } from 'express'
import type { SpotifyItemsResponse } from '@shared/types/spotify.js'

export const fetchWithAuth = async <T>({req, res, url, onSuccess}:
    {
        req: Request
        res: ExpressResponse
        url: string
        onSuccess: (data: T | null) => ExpressResponse
    }): Promise<ExpressResponse | void> => {

        const accessToken = req.session.spotifyToken?.accessToken

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

export const fetchAllPages = async <T>({req, res, url, onSuccess}:
    {
        req: Request
        res: ExpressResponse
        url: string
        onSuccess: (data: T[] | null) => ExpressResponse
    }): Promise<ExpressResponse | void> => {
        try {
            const spotifyToken = req.session.spotifyToken
            if (!spotifyToken) {
                return res.status(401).json({ error: { message: 'No token' } })
            }
            const accessToken = spotifyToken.accessToken

            let response = await fetchUrl(url, accessToken)
            if(!await checkAPIResponse(response, res)) return

            let initData = await response.json() as SpotifyItemsResponse<T>
            let jsonResponse = initData.items

            while (initData.next) {
                response = await fetchUrl(initData.next, accessToken)
                if(!await checkAPIResponse(response, res)) return

                initData = await response.json() as SpotifyItemsResponse<T>
                jsonResponse = jsonResponse.concat(initData.items)
            }

            return onSuccess(jsonResponse)

        } catch (error) {
            console.error(`get query error: ${error}`)
            return res.status(500).json({
                error: {
                    message: 'Failed to get query'
                }
            })   
        }
}

const fetchUrl = async (url:string, accessToken:string) => {
    return await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}`}
    })
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

