import { useState, useEffect } from 'react'
import { AuthContext } from './authContext'
import { useSpotifyUserStore } from '../store/useSpotifyUserStore'
import { useAppleStore } from '../store/useAppleStore'

const origin = import.meta.env.ORIGIN ?? window.location.origin

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<'loggedIn' | 'loggedOut' | 'loading'>('loading')

    const resetStore = useSpotifyUserStore(state => state.reset)
    const initializeMusicKit = useAppleStore(state => state.initializeMusicKit)
    const updateAppleStatus = useAppleStore(state => state.updateStatus)

    const logout = async (): Promise<void> => {
        await fetch('/api/spotify/auth/logout')
        resetStore() // Clear all cached data
        setStatus('loggedOut')
        window.location.href = origin
    }

    const login = () => {
        window.location.href = '/api/spotify/auth'
    }
    const fetchUser = useSpotifyUserStore((state) => state.fetchUser)
    const fetchTopTracks = useSpotifyUserStore((state) => state.fetchTopTracks)
    const fetchTopArtists = useSpotifyUserStore((state) => state.fetchTopArtists)
    const fetchPlaylists = useSpotifyUserStore((state) => state.fetchPlaylists)

    //set status here
    useEffect( () => {
        const checkSession = async () => {
            try {
                const response = await fetch('/api/spotify/user/session')
                if (!response.ok) throw new Error(`response failed with status: ${response.status}`)

                const data = await response.json()

                if (data.loggedIn) setStatus(prev => prev === 'loggedIn' ? prev : 'loggedIn')
                else {
                    setStatus('loggedOut')
                    resetStore()
                }

            } catch (error) {
                resetStore()
                setStatus('loggedOut')
                console.warn('session check failed', error)
            }
        }
        checkSession()

        window.addEventListener('focus', checkSession)
        return () => window.removeEventListener('focus', checkSession)
        
    }, [resetStore])

    // Fetch user data once when logged in
    useEffect(() => {
        if (status === 'loggedIn') {
            void fetchUser()
            void fetchTopTracks()
            void fetchTopArtists()
            void fetchPlaylists()
            void initializeMusicKit()
            void updateAppleStatus()
        }
    }, [status, fetchUser, fetchTopTracks, fetchTopArtists, fetchPlaylists, initializeMusicKit, updateAppleStatus])

    return <AuthContext.Provider value={ {status, login, logout} }>
        { children }
    </AuthContext.Provider>
}