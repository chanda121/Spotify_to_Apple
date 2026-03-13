import { create } from 'zustand'
import { fetchWithAuth } from '../utils/api'

import type {
    SpotifyPlaybackSnapshot, 
} from '@shared/types/spotify'

interface SpotifyPlayerState {
    snapshot: SpotifyPlaybackSnapshot | null,

    isLoadingSnapshot: boolean,
    snapshotError: string | null
}
interface SpotifyPlayerAction {
    fetchSnapshot: () => Promise<void>
}

export const useSpotifyPlayerStore = create<SpotifyPlayerState & SpotifyPlayerAction>((set) => ({
    snapshot: null,
    
    isLoadingSnapshot: false,
    snapshotError: null,

    fetchSnapshot: async () => {
        set({ isLoadingSnapshot: true, snapshotError: null })
        try {
            const data = await fetchWithAuth<SpotifyPlaybackSnapshot>('/api/spotify-player/get-current-track')
            set({ snapshot: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoadingSnapshot: false })
        }
    },
}))

