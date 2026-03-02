import { create } from 'zustand'
import type { StoreApi } from 'zustand'

type SetState = StoreApi<SpotifyUserState & spotifyUserAction>['setState']

import type {
  SpotifyUser,
  Playlist,
  Artist,
  SpotifyTrack,
} from '../types/spotify'

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

interface spotifyUserAction {
    fetchUser: () => Promise<void>,
    fetchTopTracks: () => Promise<void>,
    fetchTopArtists: () => Promise<void>,
    fetchPlaylists: () => Promise<void>,
    clearErrors: () => void,
    reset: () => void
}

const fetchWithAuth = async <T>(url: string): Promise<T> => {
    
    const res = await fetch(url, { credentials: 'include' })

    if(!res.ok) {
        const msg = res.status === 401 ? 'Not authenticated' : `Request failed (${res.status})`
        throw new Error(msg)
    }

    return res.json() as Promise<T>
}

const runAsyncAction = async <T>({set, loadingKey, errorKey, onSuccess, asyncFn }: 
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

export const useSpotifyUserStore = create<SpotifyUserState & spotifyUserAction>((set, get) => ({
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
        set({ isLoadingUser: true, userError: null })
        try {
            const res = await fetch('/api/user/user-info', { credentials: 'include' })
            if (!res.ok) throw new Error('Not authenticated')

            const data: SpotifyUser = await res.json()
            set({
                user: data,
                isLoadingUser: false
            })
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? error.message
                : 'Failed to fetch user data'
            set({
                userError: errorMessage,
                isLoadingUser: false,
                user: null
            })
            console.error(`fetch user error: ${error}`)
        }
    },

    fetchTopTracks: async () => {
        set({ isLoadingTopTracks: true, topTracksError: null })
        try {
            const res = await fetch('/api/user/top-tracks', { credentials: 'include' })
            if (!res.ok) throw new Error('Not authenticated')
            
            const data: SpotifyTrack[] = await res.json()

            set({topTracks: data, isLoadingTopTracks: false})
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to fetch user top tracks'
            set({
                topTracksError: errorMessage,
                isLoadingTopTracks: false,
                topTracks: []
            })
            console.error(`fetchTopTracks error: ${error}`)
        }
    },

    fetchTopArtists: async () => {
        set({ isLoadingTopArtists: true, topArtistsError: null })
        try {
            const res = await fetch('/api/user/top-artists', { credentials: 'include' })
            if (!res.ok) throw new Error('Not authenticated')
            
            const data: Artist[] = await res.json()

            set({topArtists:data, isLoadingTopArtists: false})
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to fetch user top artists'
            set({
                topArtistsError: errorMessage,
                isLoadingTopArtists: false,
                topArtists: []
            })
            console.error(`fetchTopArtists error: ${error}`)
        }
    },

    fetchPlaylists: async () => {
        set({ isLoadingPlaylists: true, playlistsError: null })
        try {
            const userId = get().user?.userId
            if (!userId) throw new Error('User not loaded')

            const limit = 10
            const offset = 0

            const res = await fetch(`/api/user/${userId}/playlists?limit=${limit}&offset=${offset}`, { credentials: 'include' })
            if (!res.ok) {
                const msg = res.status === 401 ? 'Not authenticated' : `Request failed (${res.status})`
                throw new Error(msg)
            }
            
            const data = await res.json()
            console.log(data)

            set({ playlists:data, isLoadingPlaylists: false })
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to fetch user playlists'
            set({
                playlistsError: errorMessage,
                isLoadingPlaylists: false,
                playlists: []
            })
            console.error(`fetchPlaylists error: ${error}`)
        }
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


