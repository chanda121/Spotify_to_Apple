import createError from 'http-errors'
import pRetry from 'p-retry'
import { HttpError } from 'http-errors'


export const fetchWithAppleAuth = async<T>(devToken: string, mut: string, url: string) => {
    return await pRetry<T | null>(async () => {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${devToken}`,
                'Music-User-Token': mut
            }
        })
        await checkAPIResponse(response)

        if (response.status === 204) return null    
        return await response.json() as T    
    },
    {
        onFailedAttempt: ({error, attemptNumber, retriesLeft, retriesConsumed, retryDelay}) => {
		    console.log(`IN APPLE FETCH. Attempt ${attemptNumber} failed. Retrying in ${retryDelay}ms. ${retriesLeft} retries left.`)
        },
        shouldRetry: ({ error }) => ((error instanceof HttpError && (error.status === 429 || /5\d{2}/.test(String(error.status)))) ||
            !(error instanceof HttpError)),
        maxTimeout: 15000, //15 seconds max between attempts
        randomize: true, // randomize for jitter
        retries: 3,
    })
}

export const checkAPIResponse = async (res: Response): Promise<void> => {
    if (!res.ok) {
        console.error(`Apple API error: ${await res.text().catch(() => 'could not parse...')}`)
        const errMessage = 'Apple fetch error'
        throw createError(res.status, errMessage)
    }
}