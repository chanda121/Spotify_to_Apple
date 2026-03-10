import { create } from 'zustand'
import { fetchWithAuth } from '../utils/api'

import type {
    SpotifyPlaybackSnapshot, 
} from '@shared/types/spotify'

interface SpotifyPlayerState {
    snapshot: SpotifyPlaybackSnapshot | null,
    local_progress_ms: number

    isLoadingSnapshot: boolean,
    snapshotError: string | null
}
interface SpotifyPlayerAction {
    fetchSnapshot: () => Promise<void>
}

export const useSpotifyPlayerStore = create<SpotifyPlayerState & SpotifyPlayerAction>((set) => ({
    snapshot: null,
    local_progress_ms: 0,
    
    isLoadingSnapshot: false,
    snapshotError: null,

    fetchSnapshot: async () => {
        set({ isLoadingSnapshot: true, snapshotError: null })
        try {
            const data = await fetchWithAuth<SpotifyPlaybackSnapshot>('/api/spotify-player/get_current_track')
            set({ snapshot: data, local_progress_ms: data.progress_ms })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoadingSnapshot: false })
        }
    }
}))

