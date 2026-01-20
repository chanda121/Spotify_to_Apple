import { create } from 'zustand'

import type { WebPlaybackPlayer, WebPlaybackState, WebPlaybackTrack, SpotifyPlayer } from '../types/spotify'


interface SpotifyPlayerStore {
    deviceId: string | null,
    player: SpotifyPlayer | null,
    playerVolume: number,
    state: WebPlaybackState | null,

    
}

export const useSpotifyPlayerStore = create<SpotifyPlayerStore>((set, get) => ({
    deviceId: null,
    player: null,
    playerVolume: 0,
    state: null
}))