import { create } from 'zustand'
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

    fetchPlaylists: () => {

    },

    fetchLikedSongs: () => {
        
    }


}))