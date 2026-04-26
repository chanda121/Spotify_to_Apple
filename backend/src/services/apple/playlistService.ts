import { fetchWithAppleAuth } from '../AppleAPIClient.js'
import type { AppleMusicAPIResponse, AppleMusicResource, ApplePlaylistAttributes, ApplePlaylist } from '@shared/types/apple.js'
import { checkAPIResponse } from '../SpotifyAPIClient.js'


export const getPlaylists = async (devToken: string, mut: string): Promise<ApplePlaylist[]> => {
    const url = 'https://api.music.apple.com/v1/me/library/playlists'
    const playlistPayload = await fetchWithAppleAuth<AppleMusicAPIResponse<AppleMusicResource<ApplePlaylistAttributes>>>(devToken, mut, url)

    if (!playlistPayload) return []
    return playlistPayload.data.map(playlist => ({
        id: playlist.id,
        type: playlist.type,
        href: playlist.href,
        attributes: {
            name: playlist.attributes.name,
            isPublic: playlist.attributes.isPublic,
            canEdit: playlist.attributes.canEdit,
        }
    }))
}

export const createPlaylist = async (devToken: string, mut: string) => {
    const url = 'https://api.music.apple.com/v1/me/library/playlists'
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${devToken}`,
            'Music-User-Token': mut
        },
        body: {
            fuck: 'hi'
        }
    })

    await checkAPIResponse(response)
    return await response.json()
}