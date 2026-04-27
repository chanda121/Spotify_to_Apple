import type { Image, TransferTrack } from './spotify.js'
//--------------------------------------------------- APPLE API RESOURCE INTERFACES ----------------------------------//
export interface AppleMusicAPIResponse<T> {
    data: T[],
    next?: string
}

export interface AppleMusicAPISearchResponse {
    results: {
        playlists?: AppleMusicAPIResponse<AppleMusicResource<ApplePlaylistAttributes>>,
        songs?: AppleMusicAPIResponse<AppleMusicResource<AppleSongAttributes>>,
    }
}

export interface AppleMusicResource<A> {
    id: string,
    type: string,
    href: string,
    attributes: A
}

export interface ApplePlaylistAttributes {
    name: string,
    isPublic: boolean,
    canEdit: boolean
    description?: {
        standard: string
    },
}

export interface AppleSongAttributes {
    albumName: string,
    artistName: string,
    artwork: Image,
    name: string,
    durationInMillis: number,
    isrc?: string,
}

export interface AppleStorefrontAttributes {
    supportedLanguageTags: string[],
    defaultLanguageTag: string,
    name: string,
    explicitContentPolicy: string,
}

//--------------------------------------------------- APPLE RESOURCE INTERFACES ----------------------------------//
export interface ApplePlaylist {
    id: string,
    type: string,
    attributes: ApplePlaylistAttributes
}

export interface AppleSong {
    id: string,
    type: string,
    attributes: AppleSongAttributes
}

export interface AppleTrackCandidate {
    id: string,
    name: string,
    artistName: string,
    albumName: string,
    durationMs: number,
    isrc?: string,
}

export interface TrackMatchResult {
    source: TransferTrack,
    matched: AppleTrackCandidate | null,
    matchedBy: 'isrc' | 'search' | 'none',
    confidence: 'exact' | 'fuzzy' | 'none',
}

export interface PlaylistTransferResult {
    sourcePlaylistId: string, //spotify ID
    sourceName: string,
    applePlaylist: ApplePlaylist | null,
    matches: TrackMatchResult[],
    stats: {
        totalTracks: number,
        matchedByIsrc: number,
        matchedBySearch: number,
        unmatched: number,
    }
}