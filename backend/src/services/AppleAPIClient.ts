import createError from 'http-errors'
import pRetry from 'p-retry'

export const fetchWithAppleAuth = async<T>(devToken: string, mut: string, url: string) => {
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
}

export const checkAPIResponse = async (res: Response): Promise<void> => {
    if (!res.ok) {
        console.error(`Apple API error: ${await res.text().catch(() => 'could not parse...')}`)
        const errMessage = 'Apple fetch error'
        throw createError(res.status, errMessage)
    }
}