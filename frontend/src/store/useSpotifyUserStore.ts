import { create } from 'zustand'
import type {
  SpotifyUser,
  Playlist,
  PlaylistApi,
  Artist,
  SpotifyTrack,
  Image
} from '../types/spotify'

interface SpotifyUserStore {
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

    // Actions
    fetchUser: () => Promise<void>,
    fetchTopTracks: () => Promise<void>,
    fetchTopArtists: () => Promise<void>,
    fetchPlaylists: () => Promise<void>,
    clearErrors: () => void
}

export const useSpotifyUserStore = create<SpotifyUserStore>((set, get) => ({
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

            const data = await res.json()
            set({
                user: {
                    userId: data.id,
                    email: data.email,
                    display_name: data.display_name,
                    images: data.images ?? [],
                    country: data.country,
                    product: data.product,
                },
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
            
            const data = await res.json()
            const tracks: SpotifyTrack[] = data.items.map((track: SpotifyTrack) => ({
                id: track.id,
                uri: track.uri,
                name: track.name,
                duration_ms: track.duration_ms,
                artists: track.artists.map((artist: Artist) => ({
                    id: artist.id,
                    uri: artist.uri,
                    name: artist.name,
                })),
                album: {
                    id: track.album.id,
                    uri: track.album.uri,
                    name: track.album.name,
                    release_date: track.album.release_date,
                    total_tracks: track.album.total_tracks
                }
            }))
            set({topTracks: tracks, isLoadingTopTracks: false})
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
            
            const data = await res.json()

            const artists = data.items.map((artist:Artist) => ({
                id: artist.id,
                uri: artist.uri,
                name: artist.name,
                images: artist.images?.map((image:Image) => ({
                    url: image.url,
                    height: image.height,
                    width: image.width
                }))
            }))

            set({topArtists:artists, isLoadingTopArtists: false})
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
            if (!res.ok) throw new Error('Not authenticated')
            
            const data = await res.json()
            console.log(data)

            const playlists = data.items.map((playlist: PlaylistApi) => ({
                id: playlist.id,
                uri: playlist.uri,
                name: playlist.name,
                ownerId: playlist.owner.id,
                tracksHref: playlist.tracks.href
            }))
            
            set({ playlists:playlists, isLoadingPlaylists: false })
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
    }


}))