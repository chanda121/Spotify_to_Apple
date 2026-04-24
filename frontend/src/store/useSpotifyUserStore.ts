import { create } from 'zustand'
import type { StoreApi } from 'zustand'
import type {
  SpotifyUser,
  SpotifyPlaylist,
  SpotifyArtist,
  SpotifyTrack,
} from '@shared/types/spotify.js'

import { fetchWithAuth } from '../utils/api'

const inFlightPlaylistItems = new Map<string, Promise<SpotifyTrack[] | undefined>>()

interface SpotifyUserState {
    // Data
    user: SpotifyUser | null,
    topTracks: SpotifyTrack[],
    topArtists: SpotifyArtist[],
    playlists: SpotifyPlaylist[],

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
    fetchPlaylistItems: (playlist: SpotifyPlaylist) => Promise<SpotifyTrack[] | undefined>,
    clearErrors: () => void,
    reset: () => void
}
type SetState = StoreApi<SpotifyUserState & SpotifyUserAction>['setState']
type GetState = StoreApi<SpotifyUserState & SpotifyUserAction>['getState']

const runAsyncAction = async <T>({set, get, loadingKey, errorKey, onSuccess, asyncFn}: 
    {
        get: GetState
        set: SetState
        loadingKey: keyof SpotifyUserState
        errorKey: keyof SpotifyUserState
        onSuccess: (data: T) => void | T
        asyncFn: () => Promise<T>
    }): Promise<T | undefined> => {
        const state = get()
        if (state[loadingKey]) return undefined

        set({ [loadingKey]: true, [errorKey]: null })
        try {
            const data = await asyncFn()
            onSuccess(data)
            return data
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unexpected Error'
            set({ [errorKey]: msg })
            console.error(error)
            return undefined
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
    isLoadingPlaylistTracks: false,

    // Error states
    userError: null,
    topTracksError: null,
    topArtistsError: null,
    playlistsError: null,
    playlistTracksError: null,

    fetchUser: async () => {
        await runAsyncAction({
            set, get,
            loadingKey: 'isLoadingUser',
            errorKey: 'userError',
            onSuccess: (data: SpotifyUser) => {
                set({ user: data })
            },
            asyncFn: () => fetchWithAuth<SpotifyUser>('/api/spotify/user/user-info')
        })
    },

    fetchTopTracks: async () => {
        await runAsyncAction({
            set, get,
            loadingKey: 'isLoadingTopTracks',
            errorKey: 'topTracksError',
            onSuccess: (data: SpotifyTrack[]) => {
                set({ topTracks: data })
            },
            asyncFn: () => fetchWithAuth<SpotifyTrack[]>('/api/spotify/user/top-tracks')
        })
    },

    fetchTopArtists: async () => {
        await runAsyncAction({
            set, get,
            loadingKey: 'isLoadingTopArtists',
            errorKey: 'topArtistsError',
            onSuccess: (data: SpotifyArtist[]) => {set({ topArtists: data })},
            asyncFn: () => fetchWithAuth<SpotifyArtist[]>('/api/spotify/user/top-artists')
        })
    },

    fetchPlaylists: async () => {
        const limit = 10
        const offset = 0

        await runAsyncAction({
            set, get,
            loadingKey: 'isLoadingPlaylists',
            errorKey: 'playlistsError',
            onSuccess: (data: SpotifyPlaylist[]) => {set({ playlists: data })},
            asyncFn: () => fetchWithAuth<SpotifyPlaylist[]>(`/api/spotify/user/playlists?limit=${limit}&offset=${offset}`)
        })
    },

    fetchPlaylistItems: async (playlist) => {
        const currPlaylist = get().playlists.find(p => p.id === playlist.id) ?? playlist
        if (currPlaylist.tracks !== undefined) return currPlaylist.tracks

        const existingPromise = inFlightPlaylistItems.get(playlist.id)
        if (existingPromise) return existingPromise

        const promise = fetchWithAuth<SpotifyTrack[]>(`/api/spotify/user/playlists/${playlist.id}`)
                        .then(data => {
                            set(state => ({ playlists: state.playlists.map(p => p.id === playlist.id ? {...p, tracks: data} : p) }))
                            return data
                        })
                        .catch(err => {
                            console.error(err)
                            return undefined
                        })
                        .finally(() => {
                            inFlightPlaylistItems.delete(playlist.id)
                        })
        
        inFlightPlaylistItems.set(playlist.id, promise)
        return promise
    },
    
    clearErrors: () => {
        set({
            userError: null,
            topTracksError: null,
            topArtistsError: null,
            playlistsError: null,
            playlistTracksError: null,
        })
    },

    reset: () => {
        inFlightPlaylistItems.clear()
        set({
            user: null,
            topTracks: [],
            topArtists: [],
            playlists: [],
            isLoadingUser: false,
            isLoadingTopTracks: false,
            isLoadingTopArtists: false,
            isLoadingPlaylists: false,
            isLoadingPlaylistTracks: false,
            userError: null,
            topTracksError: null,
            topArtistsError: null,
            playlistsError: null,
            playlistTracksError: null,
        })
    }
}))


