import { create } from 'zustand'
import { fetchWithAuth } from '../utils/api.js'
import type { ApplePlaylist } from '@shared/types/apple.js'

interface AppleState {
    musicKitConfigured: boolean,
    isLoadingMusicKit: boolean,
    musicKitError: string | null,

    isAuthorized: boolean,

    playlists: ApplePlaylist[],
    isLoadingPlaylists: boolean,
    playlistError: string | null
}
interface AppleAction {
    initializeMusicKit: () => Promise<void>,
    updateStatus: () => Promise<void>,
    authorize: () => Promise<void>,
    unauthorize: () => Promise<void>,
    fetchPlaylists: () => Promise<void>,
    getDevToken: () => Promise<string>,
}

type devToken = {
    devToken: string
}
type isLinked = {
    isLinked: boolean
}

export const useAppleStore = create<AppleState & AppleAction>((set, get) => ({
    musicKitConfigured: false,
    isLoadingMusicKit: false,
    musicKitError: null,

    isAuthorized: false,

    playlists: [],
    isLoadingPlaylists: false,
    playlistError: null,

    

    initializeMusicKit: async () => {
        if (get().musicKitConfigured || get().isLoadingMusicKit) return

        set({ isLoadingMusicKit: true, musicKitError: null })
        try {
            await new Promise<void>((resolve, reject) => {
                if(document.getElementById('music-kit-script')) {
                    resolve()
                    return
                }
                const script = document.createElement('script')
                script.id = 'music-kit-script'
                script.src = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js'

                script.onload = () => resolve()
                script.onerror = () => reject()

                document.head.appendChild(script)
            })

            const devToken = await get().getDevToken()

            if(!window.MusicKit) throw new Error('Music Kit failed to load!')
            await window.MusicKit.configure({
                developerToken: devToken,
                app: {name: 'S2A'}
            })
            
            set({ musicKitConfigured: true })
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unexepected error while initializing Music Kit'
            set({ musicKitError: msg })
            console.error(err)
        } finally {
            set({ isLoadingMusicKit: false })
        }

    },

    updateStatus: async () => {
        const res = await fetch('/api/apple/auth/is-linked')
        if (!res.ok) {
            console.error('failed to get authorization status')
            throw new Error('failed to get authorization status')
        } else {
            const isLinked:isLinked = await res.json()

            set({ isAuthorized: isLinked.isLinked })
        }
    },

    authorize: async () => {
        const musicKit = window.MusicKit?.getInstance()

        const mut = await musicKit?.authorize()
        if (!mut) throw new Error('authorization failed, please try again')

        const postData = { musicUserToken: mut }

        const res = await fetch('/api/apple/auth/save-token', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        })

        const message = await res.json()

        if(!res.ok) console.error('error authorizing', message)
        else set({ isAuthorized: true })
    },

    unauthorize: async () => {
        const musicKit = window.MusicKit?.getInstance()

        const res = await fetch('/api/apple/auth/logout')

        if(!res.ok) console.error(`failed to logout??`)
        set({ musicKitConfigured: false, isAuthorized: false })
        await musicKit?.unauthorize()
        await get().initializeMusicKit()
    },

    fetchPlaylists: async () => {
        const data = await fetchWithAuth<ApplePlaylist[]>('/api/apple/playlists/all')
        set({ playlists: data})
    },

    getDevToken: async () => {
        const data = await fetchWithAuth<devToken>('/api/apple/auth/dev-token')

        return data.devToken
    },

}))