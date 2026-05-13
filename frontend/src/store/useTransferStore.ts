import { create } from 'zustand'
import type { SpotifyPlaylist, TransferPlaylistInput } from '@shared/types/spotify.js'
import type { PlaylistTransferResult } from '@shared/types/apple.js'
interface TransferState {
    playlistsToTransfer: TransferPlaylistInput[],
    transferResultsSuccess: PlaylistTransferResult[],
    transferResultsFail: PlaylistTransferResult[],
}

interface TransferAction {
    addPlaylist: (playlist: SpotifyPlaylist) => void,
    removePlaylist: (playlistId: string) => void,
    togglePlaylist: (playlist: SpotifyPlaylist) => void,
    isPlaylistInTransfer: (playlistId: string) => boolean,

    transferPlaylists: () => Promise<void>,
    clearTransferPlaylists: () => void,
    clearResults: () => void,
}

export const useTransferStore = create<TransferState & TransferAction>((set, get) => ({
    playlistsToTransfer: [],
    transferResultsSuccess: [],
    transferResultsFail: [],

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
        set({ transferResultsSuccess: [], transferResultsFail: [] })
    },

    /**
     * Sets results of playlist transfer
     * @returns result data of playlist transfers
     */
    transferPlaylists: async () => {
        const response = await fetch('api/apple/playlists/create-playlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transferPlaylists: get().playlistsToTransfer
            })
        })

        if (!response.ok) {
            const errMsg = await response.json()
            console.error(`error code: ${response.status} error: ${errMsg}`)
            return
        }

        const data = await response.json() as PlaylistTransferResult[]
        const successResults = data.filter(d => d.status === 'success')
        const failResults = data.filter(d => d.status === 'failed')

        set({ transferResultsSuccess: successResults, transferResultsFail: failResults})
        console.log(data)
    }

}))