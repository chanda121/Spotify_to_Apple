export interface AppleMusicAPIResponse<T> {
    data: T[],
    next?: string
}

export interface AppleMusicResource<A> {
    id: string,
    type: string,
    href: string,
    attribute: A
}

export interface ApplePlaylistAttribute {
    name: string,
    description: {
        standard: string
    },
    isPublic: boolean,
    canEdit: boolean
}