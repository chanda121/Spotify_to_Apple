import createError from 'http-errors'
import pRetry from 'p-retry'
import { HttpError } from 'http-errors'
import type { SpotifyItemsResponse } from '@shared/types/spotify.js'

export const fetchWithAuth = async <T>(accessToken: string, url: string):Promise<T | null> => {
    return await pRetry<T | null>(async () => {
        const response = await fetchUrl(url, accessToken)
        await checkAPIResponse(response) 

        if (response.status === 204) return null
        return await response.json() as T        
    },
    {	
        onFailedAttempt: ({error, attemptNumber, retriesLeft, retriesConsumed, retryDelay}) => {
		    console.log(`IN SPOTIFY FETCH. Attempt ${attemptNumber} failed. Retrying in ${retryDelay}ms. ${retriesLeft} retries left.`)
	    },
        shouldRetry: ({ error }) => ((error instanceof HttpError && (error.status === 429 || /5\d{2}/.test(String(error.status)))) ||
            !(error instanceof HttpError)),
        maxTimeout: 15000, //15 seconds max between attempts
        randomize: true, // randomize for jitter
        retries: 3    
    })
}

export const fetchAllPages = async <T>(accessToken: string, url: string):Promise<T[]> => {
    let responseJson = await fetchWithAuth<SpotifyItemsResponse<T>>(accessToken, url)

    if (!responseJson) return []
    let data = responseJson.items

    while(responseJson && responseJson.next) {
        responseJson = await fetchWithAuth<SpotifyItemsResponse<T>>(accessToken, responseJson.next)
        
        if(!responseJson) continue
        data = data.concat(responseJson.items)
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

