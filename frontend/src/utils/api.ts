export const fetchWithAuth = async <T>(url: string): Promise<T> => {
    
    const res = await fetch(url, { credentials: 'include' })

    if (!res.ok) {
        const msg = res.status === 401 ? 'Not authenticated' : `Request failed (${res.status})`
        throw new Error(msg)
    }

    return res.json() as Promise<T>
}
