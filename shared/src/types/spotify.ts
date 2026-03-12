export interface SpotifyItemsResponse<T> {
    items: T[]
    next?: string
}

export interface SpotifyApiUser {
    id: string,
    email?: string,
    display_name: string,
    images: Image[],
    country?: string,
    product?: string,
}

export interface SpotifyUser {
    id: string,
    email?: string,
    displayName: string,
    images: Image[],
    country?: string,
    product?: string,
}

export interface SpotifyPlaylist {
    id: string,
    uri: string,
    name: string,
    ownerId: string,
    ownerName: string,
    tracksHref: string
}

export interface SpotifyAPIPlaylist {
    id: string,
    uri: string,
    href: string,
    name: string,
    description: string,
    images: Image[],
    owner: {
        id: string,
        uri: string,
        external_urls: {
            spotify: string
        },
        href: string,
        display_name: string
    }
    items: {
        href: string,
        total: number
    }
}

export interface Image {
    url: string,
    height: number,
    width: number
}
export interface SpotifyAPIAlbum {
    id: string,
    uri: string,
    name: string,
    release_date: string, //parse to date
    total_tracks: number,
    images?: Image[],
    artists?: SpotifyArtist[]
}
export interface SpotifyArtist {
    id: string,
    uri: string,
    name: string,
    images?: Image[]
}

export interface SpotifyTrack {
    id: string,
    uri: string,
    name: string,
    durationMs: number,
    artists: SpotifyArtist[],
    album: SpotifyAPIAlbum,
}
export interface SpotifyAPITrack {
    id: string,
    uri: string,
    name: string,
    duration_ms: number,
    artists: SpotifyArtist[],
    album: SpotifyAPIAlbum,
}


export interface SpotifyPlaybackSnapshot {
    isPlaying: boolean,
    timestamp: number,
    progressMs: number,
    currentlyPlayingType: string,
    trackName: string,
    trackDuration: number,
    artistNames: string[],
    albumImgs: Image[]
}

export interface SpotifyAPIPlaybackSnapshot {
    is_playing: boolean,
    timestamp: number,
    progress_ms: number,
    currently_playing_type: string,
    item: SpotifyAPITrack | null
}
export interface SpotifyAPIToken {
    access_token: string,
    token_type: string,
    expires_in: number,
    refresh_token: string
    scope?: string,
}

export interface SpotifyTokenError {
  error: string
  error_description?: string
}