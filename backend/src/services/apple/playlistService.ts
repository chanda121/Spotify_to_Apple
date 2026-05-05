import { TransferPlaylist } from '@shared/types/spotify.js'
import { fetchWithAppleAuth } from '../AppleAPIClient.js'
import { checkAPIResponse } from '../AppleAPIClient.js'
import { matchTracks } from './transferService.js'
import type { 
    AppleMusicAPIResponse, 
    AppleMusicResource, 
    ApplePlaylistAttributes, 
    ApplePlaylist, 
    AppleLibraryCreationRequest,
    TrackMatchResult, 
    ApplePlaylistCreatedResponse,
    PlaylistTransferResult,
} from '@shared/types/apple.js'

const MAX_SONGS_BATCH_SIZE = 100


export const getPlaylists = async (devToken: string, mut: string): Promise<ApplePlaylist[]> => {
    const url = 'https://api.music.apple.com/v1/me/library/playlists'
    const playlistPayload = await fetchWithAppleAuth<AppleMusicAPIResponse<AppleMusicResource<ApplePlaylistAttributes>>>(devToken, mut, url)

    if (!playlistPayload) return []
    return playlistPayload.data.map(playlist => ({
        id: playlist.id,
        type: playlist.type,
        href: playlist.href,
        attributes: {
            name: playlist.attributes.name,
            isPublic: playlist.attributes.isPublic,
            canEdit: playlist.attributes.canEdit,
        }
    }))
}

export const createPlaylist = async (devToken: string, mut: string, storefront: string, playlistToTransfer: TransferPlaylist): Promise<PlaylistTransferResult> => {
    const matchedTracksPayload = await matchTracks(devToken, mut, storefront, playlistToTransfer.tracks) as TrackMatchResult[]
    const matchedTracks = matchedTracksPayload
        .filter(matched => matched.matched !== null)
        .map(matchTrack => ({
            id: matchTrack.matched!.id,
            type: matchTrack.matched!.type,
        }))

    const reqBody: AppleLibraryCreationRequest = {
        attributes: {
            name: playlistToTransfer.name,
            description: playlistToTransfer.description
        },
    }

    const createUrl = 'https://api.music.apple.com/v1/me/library/playlists'
    const createPlaylistResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${devToken}`,
            'Music-User-Token': mut,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqBody)
    })
    await checkAPIResponse(createPlaylistResponse)
    const playlistCreatedPayloadRaw = await createPlaylistResponse.json() as AppleMusicAPIResponse<ApplePlaylistCreatedResponse>
    const playlistCreatedPayload = playlistCreatedPayloadRaw.data[0]
    const createdPlaylistId = playlistCreatedPayload.id


    const addTracksUrl = `https://api.music.apple.com/v1/me/library/playlists/${createdPlaylistId}/tracks`

    for (let ind = 0; ind < matchedTracks.length; ind+=MAX_SONGS_BATCH_SIZE) {
        const currTracks = matchedTracks.slice(ind, ind+MAX_SONGS_BATCH_SIZE)
        const trackData = {
            data: currTracks
        }
        const addTracksResponse = await fetch(addTracksUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${devToken}`,
                'Music-User-Token': mut,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(trackData)
        })
        await checkAPIResponse(addTracksResponse)        

    }

    const playlistCreatedResponse: PlaylistTransferResult = {
        sourcePlaylistId: playlistToTransfer.id,
        sourceName: playlistToTransfer.name,
        applePlaylist: {
            id: playlistCreatedPayload.id,
            type: playlistCreatedPayload.type,
            attributes: {
                name: playlistCreatedPayload.attributes.name,
                isPublic: playlistCreatedPayload.attributes.isPublic,
                canEdit: playlistCreatedPayload.attributes.canEdit,
            }
        },
        matches: matchedTracksPayload,
        stats: {
            totalTracks: playlistToTransfer.tracks.length,
            matchedByIsrc: matchedTracksPayload.filter(track => track.matchedBy === 'isrc').length,
            matchedBySearch: matchedTracksPayload.filter(track => track.matchedBy === 'search').length,
            unmatched: matchedTracksPayload.filter(track => track.matched === null).length
        }
    }

    return playlistCreatedResponse
}

export const createPlaylists = async (devToken: string, mut: string, storefront: string, playlistsToTransfer:TransferPlaylist[]) => {
    const resultPromises: Promise<PlaylistTransferResult>[] = []

    playlistsToTransfer.forEach((playlist) => {resultPromises.push(createPlaylist(devToken, mut, storefront, playlist))})
    
    const playlistTransferResults:PlaylistTransferResult[] = []

    const results = await Promise.allSettled(resultPromises)

    results.forEach((transferResult) => {
        if (transferResult.status === 'fulfilled') {
            playlistTransferResults.push(transferResult.value)
        }
    })

    const failures = results.filter(transferResult => transferResult.status === 'rejected')
    for (const failure of failures) {
        console.error(`Failed to transfer playlist: ${failure.reason}`)
    }

    return playlistTransferResults
}