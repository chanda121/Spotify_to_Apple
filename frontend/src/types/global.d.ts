export {}

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void,
        Spotify?: typeof Spotify
    }
}

