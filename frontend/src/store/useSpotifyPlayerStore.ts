import { create } from 'zustand'
import { fetchWithAuth } from '../utils/api'
import type { 
    WebPlaybackState, 
    WebPlaybackTrack, 
} from '../types/spotify'


interface SpotifyPlayerStore {
    currentTrack: WebPlaybackTrack,
    currentPosition: 
}

export const useSpotifyPlayerStore = create<SpotifyPlayerStore>((set, get) => ({
    

    
}))