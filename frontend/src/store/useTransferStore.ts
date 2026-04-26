import { create } from 'zustand'
import { useSpotifyUserStore } from './useSpotifyUserStore'
import type { TransferPlaylist, TransferTrack, SpotifyPlaylist } from '@shared/types/spotify'
interface TransferState {
    playlistsToTransfer: TransferPlaylist[]
}

interface TransferAction {
    addPlaylist: (playlist: SpotifyPlaylist) => Promise<void>,
    addMultiplePlaylists: (playlists: SpotifyPlaylist[]) => Promise<void>,
    removePlaylist: (playlist: SpotifyPlaylist) => void,
    togglePlaylist: (playlist: SpotifyPlaylist) => Promise<void>,
    isPlaylistInTransfer: (playlistId: string) => boolean,
    test: () => Promise<void>,
    clearAll: () => void,
}

export const useTransferStore = create<TransferState & TransferAction>((set, get) => ({
    playlistsToTransfer: [],

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
            tracks: transferTracks,
        }

        set(state => ({playlistsToTransfer: [...state.playlistsToTransfer, playlistToAdd]}))
    },

    addMultiplePlaylists: async (playlists: SpotifyPlaylist[]) => {
        await Promise.all(playlists.map(p => get().addPlaylist(p)))
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
        set({ playlistsToTransfer: [] })
    },

    test: async () => {
        console.log(`transfer playlist: ${get().playlistsToTransfer[0]}`)
        const response = await fetch('api/apple/playlists/matchTracks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transferTracks: get().playlistsToTransfer[0].tracks
            })
        })

        if (!response.ok) return
        console.log(response)
    }

}))