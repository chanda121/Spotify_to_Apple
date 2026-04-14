import createError from 'http-errors'
import type { SpotifyItemsResponse } from '@shared/types/spotify.js'

export const fetchWithAuth = async <T>(accessToken: string, url: string):Promise<T | null> => {
    const response = await fetchUrl(url, accessToken)
    await checkAPIResponse(response) 

    if (response.status === 204) return null
    return await response.json() as T
}

export const fetchAllPages = async <T>(accessToken: string, url: string):Promise<T[]> => {
    let response = await fetchUrl(url, accessToken)
    await checkAPIResponse(response)

    if (response.status === 204) return []
    let responseData = await response.json() as SpotifyItemsResponse<T>
    let data = responseData.items

    while(responseData.next) {
        response = await fetchUrl(responseData.next, accessToken)
        await checkAPIResponse(response)

        responseData = await response.json() as SpotifyItemsResponse<T>
        data = data.concat(responseData.items)
    }

    return data
}

const fetchUrl = async (url:string, accessToken:string) => {
    return await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}`}
    })
}

export const checkAPIResponse = async (res: Response): Promise<void> => {
    if (!res.ok) {
        console.error(`Spotify API error: ${await res.text().catch(() => 'could not parse...')}`)
        const errMessage = 'Spotify fetch error'
        throw createError(res.status, errMessage)
    }
}

