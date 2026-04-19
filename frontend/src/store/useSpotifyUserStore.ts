import { create } from 'zustand'
import type { StoreApi } from 'zustand'
import type {
  SpotifyUser,
  SpotifyPlaylist,
  SpotifyArtist,
  SpotifyTrack,
} from '@shared/types/spotify.js'

import { fetchWithAuth } from '../utils/api'

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
    isLoadingPlaylistTracks: boolean,

    // Error states
    userError: string | null,
    topTracksError: string | null,
    topArtistsError: string | null,
    playlistsError: string | null,
    playlistTracksError: string | null,
}
interface SpotifyUserAction {
    fetchUser: () => Promise<void>,
    fetchTopTracks: () => Promise<void>,
    fetchTopArtists: () => Promise<void>,
    fetchPlaylists: () => Promise<void>,
    fetchPlaylistItems: (playlist: SpotifyPlaylist) => Promise<SpotifyTrack[]>,
    clearErrors: () => void,
    reset: () => void
}
type SetState = StoreApi<SpotifyUserState & SpotifyUserAction>['setState']


const runAsyncAction = async <T>({set, loadingKey, errorKey, onSuccess, asyncFn}: 
    {
        set: SetState
        loadingKey: string
        errorKey: string
        onSuccess: (data: T) => void | T
        asyncFn: () => Promise<T>
    }): Promise<T | undefined> => {
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
            set,
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
            set,
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
            set,
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
            set,
            loadingKey: 'isLoadingPlaylists',
            errorKey: 'playlistsError',
            onSuccess: (data: SpotifyPlaylist[]) => {set({ playlists: data })},
            asyncFn: () => fetchWithAuth<SpotifyPlaylist[]>(`/api/spotify/user/playlists?limit=${limit}&offset=${offset}`)
        })
    },
    //look at the case where there is a fetch error and it returns an empty playlist, see if plausible etc
    fetchPlaylistItems: async (playlist) => {
        const currPlaylist = get().playlists.find(p => p.id === playlist.id) ?? playlist
        if (currPlaylist.tracks !== undefined) {
            return currPlaylist.tracks
        }
        return await runAsyncAction({
            set,
            loadingKey: 'isLoadingPlaylistTracks',
            errorKey: 'playlistTracksError',
            onSuccess: (data: SpotifyTrack[]) => {
                set(state => ({playlists: state.playlists.map(p => p.id === playlist.id ? {...p, tracks: data} : p)}))
                return data                                                
            },
            asyncFn: () => fetchWithAuth<SpotifyTrack[]>(`/api/spotify/user/playlists/${playlist.id}`)
        }) as SpotifyTrack[]
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


