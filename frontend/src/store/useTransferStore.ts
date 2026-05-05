import { create } from 'zustand'
import { useSpotifyUserStore } from './useSpotifyUserStore'
import type { TransferPlaylist, TransferTrack, SpotifyPlaylist } from '@shared/types/spotify'
interface TransferState {
    playlistsToTransfer: TransferPlaylist[],
    selectedPlaylistIds: string[],
}

interface TransferAction {
    addPlaylist: (playlist: SpotifyPlaylist) => Promise<void>,
    removePlaylist: (playlist: SpotifyPlaylist) => void,
    togglePlaylist: (playlist: SpotifyPlaylist) => Promise<void>,
    isPlaylistInTransfer: (playlistId: string) => boolean,

    selectPlaylistId: (id: string) => void,
    deselectPlaylistId: (id: string) => void,
    toggleSelectedPlaylistId: (id: string) => void,

    conformPlaylists: () => void,
    test: () => Promise<void>,
    clearAll: () => void,
}

export const useTransferStore = create<TransferState & TransferAction>((set, get) => ({
    playlistsToTransfer: [],
    selectedPlaylistIds: [],

    addPlaylist: async (playlist: SpotifyPlaylist) => {
        if (get().isPlaylistInTransfer(playlist.id)) return
        const tracks = await useSpotifyUserStore.getState().fetchPlaylistItems(playlist)
        if (get().isPlaylistInTransfer(playlist.id)) return   // post-await recheck

        if (!tracks) return

        const transferTracks: TransferTrack[] = tracks.map(track => ({
            trackName: track.name,
            artistNames: track.artists.map(artist => artist.name),
            isrc: track.isrc,
            durationMs: track.durationMs,
            albumName: track.album.name
        }))

        const playlistToAdd: TransferPlaylist = {
            id: playlist.id,
            name: playlist.name,
            description: playlist.description,
            tracks: transferTracks,
        }

        set(state => ({playlistsToTransfer: [...state.playlistsToTransfer, playlistToAdd]}))
    },

    removePlaylist: (playlist: SpotifyPlaylist) => {
        const newPlaylists = get().playlistsToTransfer.filter(p => p.id !== playlist.id)

        set({ playlistsToTransfer: newPlaylists })
    },

    togglePlaylist: async (playlist: SpotifyPlaylist) => {
        if (get().isPlaylistInTransfer(playlist.id)) {
            get().removePlaylist(playlist)
        } else {
            await get().addPlaylist(playlist)
        }
    },

    isPlaylistInTransfer: (playlistId) => {
        for(const playlist of get().playlistsToTransfer) {
            if (playlist.id === playlistId) return true
        }
        return false
    },

    clearAll: () => {
        set({ playlistsToTransfer: [], selectedPlaylistIds: [] })
    },

    selectPlaylistId: (id: string) => {
        set(state => ({selectedPlaylistIds: [...state.selectedPlaylistIds, id]}))
    },
    deselectPlaylistId: (id: string) => {
        if (get().selectedPlaylistIds.includes(id)) {
            set(state => ({selectedPlaylistIds: state.selectedPlaylistIds.filter(selectedId => selectedId !== id)}))
        }
    },
    toggleSelectedPlaylistId: (id: string) => {
        if (get().selectedPlaylistIds.includes(id)) get().deselectPlaylistId(id)
        else get().selectPlaylistId(id)
    },

    conformPlaylists: () => {
        set(state => ({playlistsToTransfer: state.playlistsToTransfer.filter(p => state.selectedPlaylistIds.includes(p.id))}))
    },

    test: async () => {
        console.log('final number of playlists to be transferred: ', get().playlistsToTransfer.length)
        console.log(get().playlistsToTransfer[0].id, get().playlistsToTransfer[0].name)
        const response = await fetch('api/apple/playlists/create-playlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transferPlaylists: get().playlistsToTransfer
            })
        })

        if (!response.ok) return

        const data = await response.json()
        console.log(data)

        return data
    }

}))