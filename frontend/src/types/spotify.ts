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

export interface WebPlaybackPlayer {
    device_id: string
}

export interface WebPlaybackTrack {
    id: string,
    uri: string,
    name: string,
    album: {
        uri: string,
        name: string,
        images: {
            url: string
        }[],
        artists: {
            uri: string,
            name: string
        }[]
    },
    artists: {
        uri:string,
        name: string,
    }[]
}
export interface WebPlaybackState {
    paused: boolean,
    position: number, //in ms
    repeat_mode?: number,
    shuffle?: false,
    duration: number,
    track_window: {
        current_track: WebPlaybackTrack,
        previous_tracks: WebPlaybackTrack[],
        next_tracks: WebPlaybackTrack[]
    }
}
