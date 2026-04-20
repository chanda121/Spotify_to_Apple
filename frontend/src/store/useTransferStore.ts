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
}

export const useTransferStore = create<TransferState & TransferAction>((set, get) => ({
    playlistsToTransfer: [],

    addPlaylist: async (playlist: SpotifyPlaylist) => {
        const tracks = await useSpotifyUserStore.getState().fetchPlaylistItems(playlist)

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

        set(state => ({playlistsToTransfer: {...state.playlistsToTransfer, playlistToAdd}}))
    },

    addMultiplePlaylists: async (playlists: SpotifyPlaylist[]) => {
        playlists.forEach(playlist => { get().addPlaylist(playlist) })
    },

    removePlaylist: async (playlist: SpotifyPlaylist) => {
        const newPlaylists = get().playlistsToTransfer.filter(p => p.id !== playlist.id)

        set({ playlistsToTransfer: newPlaylists })
    },

    togglePlaylist: async (playlist: SpotifyPlaylist) => {

    },

    isPlaylistInTransfer: (playlistId) => {
        for(const playlist of get().playlistsToTransfer) {
            if (playlist.id === playlistId) return true
        }
        return false
    }

}))