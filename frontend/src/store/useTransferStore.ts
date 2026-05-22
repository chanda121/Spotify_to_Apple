import { create } from 'zustand'
import type { SpotifyPlaylist, TransferPlaylistInput } from '@shared/types/spotify.js'
import type { PlaylistTransferResult } from '@shared/types/apple.js'
interface TransferState {
    playlistsToTransfer: TransferPlaylistInput[],
    transferResultsSuccess: PlaylistTransferResult[],
    transferResultsFail: PlaylistTransferResult[],
    isTransferring: boolean,
    transferError: string | null,
}

interface TransferAction {
    addPlaylist: (playlist: SpotifyPlaylist) => void,
    removePlaylist: (playlistId: string) => void,
    togglePlaylist: (playlist: SpotifyPlaylist) => void,
    isPlaylistInTransfer: (playlistId: string) => boolean,

    transferPlaylists: () => Promise<boolean>,
    clearTransferPlaylists: () => void,
    clearResults: () => void,
}

export const useTransferStore = create<TransferState & TransferAction>((set, get) => ({
    playlistsToTransfer: [],
    transferResultsSuccess: [],
    transferResultsFail: [],
    isTransferring: false,
    transferError: null,

    addPlaylist: (playlist: SpotifyPlaylist) => {
        const playlistToAdd: TransferPlaylistInput = {
            id: playlist.id,
            name: playlist.name,
            description: playlist.description,
        }

        set(state => ({playlistsToTransfer: [...state.playlistsToTransfer, playlistToAdd]}))
    },

    removePlaylist: (playlistId: string) => {
        const newPlaylists = get().playlistsToTransfer.filter(p => p.id !== playlistId)

        set({ playlistsToTransfer: newPlaylists })
    },

    togglePlaylist: (playlist: SpotifyPlaylist) => {
        if (get().isPlaylistInTransfer(playlist.id)) {
            get().removePlaylist(playlist.id)
        } else {
            get().addPlaylist(playlist)
        }
    },

    isPlaylistInTransfer: (playlistId) => {
        for(const playlist of get().playlistsToTransfer) {
            if (playlist.id === playlistId) return true
        }
        return false
    },

    clearTransferPlaylists: () => {
        set({ playlistsToTransfer: []})
    },

    clearResults: () => {
        set({ transferResultsSuccess: [], transferResultsFail: [], isTransferring: false, transferError: null })
    },

    /**
     * Sets results of playlist transfer
     * @returns result data of playlist transfers
     */
    transferPlaylists: async () => {
        set({ isTransferring: true, transferError: null })

        try {
            const response = await fetch('/api/apple/playlists/create-playlists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transferPlaylists: get().playlistsToTransfer
                })
            })

            if (!response.ok) {
                const body = await response.json().catch(() => null)
                const errMsg = body?.error?.message ?? `Transfer failed: ${response.status}`
                set({ transferError: errMsg })
                return false
            }

            const data = await response.json() as PlaylistTransferResult[]
            const successResults = data.filter(d => d.status === 'success')
            const failResults = data.filter(d => d.status === 'failed') 
            set({ transferResultsSuccess: successResults, transferResultsFail: failResults})
            console.log(data)           
            return true
        } catch (error) {
            set({ transferError: error instanceof Error ? error.message : 'Unexpected transfer error'})
            return false
        } finally {
            set({ isTransferring: false })
        }
    }

}))