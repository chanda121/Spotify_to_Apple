export interface SpotifyItemsResponse<T> {
    items: T[]
}

export interface SpotifyUser {
    userId: string,
    email?: string,
    display_name: string,
    images: Image[],
    country?: string,
    product?: string,
}
export interface SpotifyPlaylist {
    id: string,
    uri: string,
    name: string,
    ownerId: string,
    tracksHref: string
}
export interface Image {
    url: string,
    height: number,
    width: number
}
export interface SpotifyAlbum {
    id: string,
    uri: string,
    name: string,
    release_date: string, //parse to date
    total_tracks: number,
    images?: Image[],
    artists?: Artist[]
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
    duration_ms: number,
    artists: Artist[],
    album: Album,
}

export interface PlaybackSnapshot {
    is_playing: boolean,
    timestamp: number,
    progress_ms: number,
    currently_playing_type: string,
    track: SpotifyTrack
}