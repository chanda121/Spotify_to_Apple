import { create } from 'zustand'
import { fetchWithAuth } from '../utils/api.js'
import type { ApplePlaylist } from '@shared/types/apple.js'

interface AppleState {
    musicKitConfigured: boolean,
    isLoadingMusicKit: boolean,
    musicKitError: string | null,

    isAuthorized: boolean,

    playlists: ApplePlaylist[],
    isLoadingPlaylists: boolean,
    playlistError: string | null

}
interface AppleAction {
    initializeMusicKit: () => Promise<void>,
    authorize: () => Promise<void>,
    fetchPlaylists: () => Promise<void>,
    fetchLikedSongs: () => Promise<void>,
    getDevToken: () => string
}

type devToken = {
    devToken: string
}

type placeholder = {

}

export const useAppleStore = create<AppleState | AppleAction>((set) => ({
    musicKitConfigured: false,
    isLoadingMusicKit: false,
    musicKitError: null,

    isAuthorized: false,

    playlists: [],
    isLoadingPlaylists: false,
    playlistError: null,

    initializeMusicKit: () => {
        
    },

    authorize: () => {

    },

    fetchPlaylists: async () => {
        const data = await fetchWithAuth<placeholder>('/api/apple/user/playlists')

    },

    fetchLikedSongs: async () => {
        const data = await fetchWithAuth<placeholder>('/api/apple/user/liked-songs')

    },

    getDevToken: async () => {
        const data = await fetchWithAuth<devToken>('/api/apple/auth/dev-token')

        return data.devToken
    }

}))