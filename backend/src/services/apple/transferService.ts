import type { TransferTrack } from '@shared/types/spotify.js'
import type { AppleMusicAPIResponse, AppleMusicResource, AppleSong, AppleSongAttributes, TrackMatchResult } from '@shared/types/apple.js'
import { checkAPIResponse } from '../AppleAPIClient.js'

const ISRC_BATCH_SIZE = 25 //hard limit

export const matchTracks = async (devToken: string, mut: string, storefront: string, sourceTracks: TransferTrack[]) => {
    const isrcTracks = sourceTracks.filter(track => track.isrc)
    const searchTracks = sourceTracks.filter(track => !track.isrc)

    const isrcMatchResults: TrackMatchResult[] = []
    const searchMatchResults: TrackMatchResult[] = []

    let irscMatchPayload: AppleSong[] = []

    // GET ISRCMATCH PAYLOAD //
    const url = `https://api.music.apple.com/v1/catalog/${storefront}/songs`
    for (let i = 0; i < isrcTracks.length; i+=ISRC_BATCH_SIZE) {
        const batch = isrcTracks.slice(i, i+ISRC_BATCH_SIZE).map(track => track.isrc)
        const params = new URLSearchParams()
        params.set('filter[isrc]', batch.join(','))

        const response = await fetch(`${url}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${devToken}`,
                'Music-User-Token': mut
            }
        })

        await checkAPIResponse(response)

        const trackPayload = await response.json() as AppleMusicAPIResponse<AppleMusicResource<AppleSongAttributes>>
        irscMatchPayload = [...irscMatchPayload, ...trackPayload.data]
    }

    const isrcGroupMap = groupBy(irscMatchPayload, (song) => song.attributes.isrc)

    // ADD MATCH RESULTS TO ISRCMATCHRESULTS //
    for (const sourceTrack of isrcTracks) {
        const candidates = isrcGroupMap.get(sourceTrack.isrc ?? '') ?? []

        if (candidates.length === 0) {
            isrcMatchResults.push({
                source: sourceTrack,
                matched: null,
                matchedBy: 'none',
                confidence: 'none',
            })
            continue
        }
        const bestCandidate = candidates.reduce((bestSoFar, candidate) => {
            return scoreIsrcCandidate(sourceTrack, candidate) > scoreIsrcCandidate(sourceTrack, bestSoFar)
                ? candidate
                : bestSoFar
        })

        isrcMatchResults.push({
            source: sourceTrack,
            matched: {
                id: bestCandidate.id,
                name: bestCandidate.attributes.name,
                artistName: bestCandidate.attributes.artistName,
                albumName: bestCandidate.attributes.albumName,
                durationMs: bestCandidate.attributes.durationInMillis,
                isrc: bestCandidate.attributes.isrc
            },
            matchedBy: 'isrc',
            confidence: 'exact'
        })
    }

    return [...isrcMatchResults, ...searchMatchResults]
    
}

const groupBy = <T, K>(items: T[], getKey: (item: T) => K | undefined): Map<K, T[]> => {
    const groups = new Map<K,T[]>()

    for (const item of items) {
        const key = getKey(item)
        if (key === undefined) continue

        const group = groups.get(key) ?? []
        group.push(item)
        groups.set(key, group)
    }

    return groups
}

const scoreIsrcCandidate = (source: TransferTrack, candidate: AppleSong) => {
    let score = 0

    if (source.durationMs && candidate.attributes.durationInMillis) {
        const diff = Math.abs(source.durationMs - candidate.attributes.durationInMillis)

        if (diff <= 2000) score += 30
        else if (diff <= 5000) score += 15
        else if (diff <= 10000) score += 5
    }
    const sourceAlbum = source.albumName
    const candAlbum = candidate.attributes.albumName

    if (sourceAlbum && candAlbum && sourceAlbum === candAlbum) score += 30
    
    const sourceTrackName = source.trackName
    const candTrackName = candidate.attributes.name

    if (sourceTrackName === candTrackName) score += 10

    return score
}