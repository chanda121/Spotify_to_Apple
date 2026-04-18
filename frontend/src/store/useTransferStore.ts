import { create } from 'zustand'
import { useSpotifyUserStore } from './useSpotifyUserStore'
import type { TransferPlaylist, TransferTrack, SpotifyPlaylist } from '@shared/types/spotify'

const getPlaylistTracks = useSpotifyUserStore(state => state.fetchPlaylistItems)

interface TransferState {
    playlistsToTransfer: TransferPlaylist[]
}

interface TransferAction {
    addPlaylist: () => void,
    
}

export const useTransferStore = create<TransferState & TransferAction>((set) => ({
    playlistsToTransfer: [],

    addPlaylist: (playlist: SpotifyPlaylist) => {
        
    }
}))