export interface Image {
    url: string,
    height: number,
    width: number
}
//--------------------------------------------------- SPOTIFY API RESOURCE INTERFACES ----------------------------------//
export interface SpotifyItemsResponse<T> {
    items: T[]
    next?: string
}
export interface SpotifyApiUser {
    id: string,
    uri: string
    email?: string,
    display_name: string,
    images: Image[],
    country?: string,
    product?: string,
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
export interface SpotifyAPIArtist {
    id: string,
    uri: string,
    name: string,
    images?: Image[]
}
export interface SpotifyAPIAlbum {
    id: string,
    uri: string,
    name: string,
    release_date: string, //parse to date
    total_tracks: number,
    images?: Image[],
    artists?: SpotifyAPIArtist[]
}
export interface SpotifyAPITrack {
    id: string,
    uri: string,
    name: string,
    duration_ms: number,
    artists: SpotifyAPIArtist[],
    album: SpotifyAPIAlbum,
    type?: string,
    external_ids: {
        isrc: string
    }
}
export interface SpotifyAPIPlaylistTrack {
    added_at: string,
    item: SpotifyAPITrack
}

export interface SpotifyAPILikedSongsObject {
    added_at: string, //date-time
    track: SpotifyAPITrack
}
//--------------------------------------------------- SPOTIFY RESOURCE INTERFACES --------------------------------------//
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
    name: string,
    description: string,
    ownerId: string,
    ownerName: string,
    images?: Image[],
    tracks?: SpotifyTrack[]
}
export interface SpotifyArtist {
    id: string,
    name: string,
    images?: Image[]
}
export interface SpotifyAlbum {
    id: string,
    name: string,
    releaseDate: string, //parse to date
    totalTracks: number,
    images?: Image[],
    artists?: SpotifyArtist[]
}
export interface SpotifyTrack {
    id: string,
    name: string,
    durationMs: number,
    artists: SpotifyArtist[],
    album: SpotifyAlbum,
    isrc?: string
}

//--------------------------------------------------- SPOTIFY PLAYBACK INTERFACES --------------------------------------//
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
//--------------------------------------------------- SPOTIFY TRANSFER INTERFACES --------------------------------------//
export interface TransferTrack {
    trackName: string,
    artistNames: string[],
    isrc?: string,
    durationMs?: number
    albumName?: string,   
}

export interface TransferPlaylist {
    id: string,
    name: string,
    description: string,
    tracks: TransferTrack[]
}

//--------------------------------------------------- SPOTIFY TOKEN INTERFACES -----------------------------------------//
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