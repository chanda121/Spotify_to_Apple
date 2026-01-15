export interface SpotifyUser {
    userId: string,
    email?: string,
    display_name: string,
    images: Image[],
    country?: string,
    product?: string,
}
export interface Playlist {
    id: string,
    uri: string,
    name: string,
    ownerId: string,
    tracksHref: string
}
export interface PlaylistApi {
    id: string,
    uri: string,
    name: string,
    owner:{
        id: string  // Changed from number
    }
    tracks: {
        href: string
    }
}
export interface Image {
    url: string,
    height: number,
    width: number
}
export interface Album {
    id: string,
    uri: string,
    name: string,
    release_date: string, //parse to date
    total_tracks: number,
    images?: Image[],
    artists?: Artist[]
}
export interface Artist {
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

