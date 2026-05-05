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
    authorize: () => Promise<void>,
    unauthorize: () => Promise<void>,
    fetchPlaylists: () => Promise<void>,
    getDevToken: () => Promise<string>
}

type devToken = {
    devToken: string
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
            

        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unexepected error while initializing Music Kit'
            set({ musicKitError: msg })
            console.error(err)
        } finally {
            set({ isLoadingMusicKit: false })
        }

    },

    authorize: async () => {
        const musicKit = window.MusicKit?.getInstance()

        const mut = await musicKit?.authorize()

        const postData = { musicUserToken: mut }

        const res = await fetch('/api/apple/auth/save-token', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        })

        const message = await res.json()
        set({ isAuthorized: true })

        if(!res.ok) console.error('error authorizing', message)
    },

    unauthorize: async () => {
        const musicKit = window.MusicKit?.getInstance()
        set({ isAuthorized: false })
        await musicKit?.unauthorize()
    },

    fetchPlaylists: async () => {
        const data = await fetchWithAuth<ApplePlaylist[]>('/api/apple/playlists/all')
        console.log(data)
    },

    getDevToken: async () => {
        const data = await fetchWithAuth<devToken>('/api/apple/auth/dev-token')

        return data.devToken
    },

}))