import { create } from 'zustand'
import type { StoreApi } from 'zustand'
import type {
  SpotifyUser,
  Playlist,
  Artist,
  SpotifyTrack,
} from '../types/spotify'

import { fetchWithAuth } from '../utils/api'

interface SpotifyUserState {
    // Data
    user: SpotifyUser | null,
    topTracks: SpotifyTrack[],
    topArtists: Artist[],
    playlists: Playlist[],

    // Loading states
    isLoadingUser: boolean,
    isLoadingTopTracks: boolean,
    isLoadingTopArtists: boolean,
    isLoadingPlaylists: boolean,

    // Error states
    userError: string | null,
    topTracksError: string | null,
    topArtistsError: string | null,
    playlistsError: string | null,
}
interface SpotifyUserAction {
    fetchUser: () => Promise<void>,
    fetchTopTracks: () => Promise<void>,
    fetchTopArtists: () => Promise<void>,
    fetchPlaylists: () => Promise<void>,
    clearErrors: () => void,
    reset: () => void
}
type SetState = StoreApi<SpotifyUserState & SpotifyUserAction>['setState']


const runAsyncAction = async <T>({set, loadingKey, errorKey, onSuccess, asyncFn}: 
    {
        set: SetState
        loadingKey: string
        errorKey: string
        onSuccess: (data: T) => void
        asyncFn: () => Promise<T>
    }) => {
        set({ [loadingKey]: true, [errorKey]: null })
        try {
            const data = await asyncFn()
            onSuccess(data)
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unexpected Error'
            set({ [errorKey]: msg })
            console.error(error)
        } finally {
            set({ [loadingKey]: false })
        }
    }

export const useSpotifyUserStore = create<SpotifyUserState & SpotifyUserAction>((set, get) => ({
    user: null,
    topTracks: [],
    topArtists: [],
    playlists: [],

    // Loading states
    isLoadingUser: false,
    isLoadingTopTracks: false,
    isLoadingTopArtists: false,
    isLoadingPlaylists: false,

    // Error states
    userError: null,
    topTracksError: null,
    topArtistsError: null,
    playlistsError: null,

    fetchUser: async () => {
        await runAsyncAction({
            set,
            loadingKey: 'isLoadingUser',
            errorKey: 'userError',
            onSuccess: (data: SpotifyUser) => {
                set({ user: data })
            },
            asyncFn: () => fetchWithAuth<SpotifyUser>('/api/user/user-info')
        })
    },

    fetchTopTracks: async () => {
        await runAsyncAction({
            set,
            loadingKey: 'isLoadingTopTracks',
            errorKey: 'topTracksError',
            onSuccess: (data: SpotifyTrack[]) => {
                set({ topTracks: data })
            },
            asyncFn: () => fetchWithAuth<SpotifyTrack[]>('/api/user/top-tracks')
        })
    },

    fetchTopArtists: async () => {
        await runAsyncAction({
            set,
            loadingKey: 'isLoadingTopArtists',
            errorKey: 'topArtistsError',
            onSuccess: (data: Artist[]) => {set({ topArtists: data })},
            asyncFn: () => fetchWithAuth<Artist[]>('/api/user/top-artists')
        })
    },

    fetchPlaylists: async () => {
        const userId = get().user?.userId
        if (!userId) throw new Error('User not loaded')

        const limit = 10
        const offset = 0
        await runAsyncAction({
            set,
            loadingKey: 'isLoadingPlaylists',
            errorKey: 'playlistsError',
            onSuccess: (data: Playlist[]) => {set({ playlists: data })},
            asyncFn: () => fetchWithAuth<Playlist[]>(`/api/user/${userId}/playlists?limit=${limit}&offset=${offset}`)
        })
    },
    
    clearErrors: () => {
        set({
            userError: null,
            topTracksError: null,
            topArtistsError: null,
            playlistsError: null
        })
    },

    reset: () => {
        set({
            user: null,
            topTracks: [],
            topArtists: [],
            playlists: [],
            isLoadingUser: false,
            isLoadingTopTracks: false,
            isLoadingTopArtists: false,
            isLoadingPlaylists: false,
            userError: null,
            topTracksError: null,
            topArtistsError: null,
            playlistsError: null
        })
    }
}))


