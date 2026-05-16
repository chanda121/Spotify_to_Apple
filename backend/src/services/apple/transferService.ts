import { fetchWithAppleAuth } from '../AppleAPIClient.js'
import { getPlaylistTracks } from '../spotify/playlistService.js'
import { createPlaylists } from './playlistService.js'
import type { TransferPlaylistInput, TransferPlaylist, TransferTrack} from '@shared/types/spotify.js'
import type { AppleMusicAPISearchResponse, AppleMusicAPIResponse, AppleMusicResource, AppleSong, AppleSongAttributes, TrackMatchResult, PlaylistTransferResult } from '@shared/types/apple.js'

const ISRC_BATCH_SIZE = 25 //hard limit
const TOTAL_SCORE = 100

type IndexedTrackMatchResult = TrackMatchResult & {
    index: number
}

export const transferPlaylists = async (appleDevToken: string, mut: string, appleStorefront: string, spotifyAccessToken: string,  playlists: TransferPlaylistInput[]):Promise<PlaylistTransferResult[]>  => {
    // For each playlist id, get tracks, then match tracks, then call create playlists

    const settledPlaylistsToTransfer = await Promise.all(
        playlists.map(async (playlist) => {
            try {
                const tracks = await getPlaylistTracks(spotifyAccessToken, {id: playlist.id})
                const transferTracks: TransferTrack[] = tracks.map(track => ({
                    trackName: track.name,
                    artistNames: track.artists.map(artist => artist.name),
                    isrc: track.isrc,
                    durationMs: track.durationMs,
                    albumName: track.album.name
                }))
            
                return {
                    ok: true as const,
                    playlist: {
                        id: playlist.id,
                        name: playlist.name,
                        description: playlist.description,
                        tracks: transferTracks
                    }
                }

            } catch (err) {
                console.error(err)
                return {
                    ok: false as const,
                    source: playlist,
                    error: err instanceof Error ? err.message : String(err)
                }
            }

    }))

    const fulfilledTransferPlaylists: TransferPlaylist[] = settledPlaylistsToTransfer
        .filter(transferPromise => transferPromise.ok === true)
        .map(transferPromise => transferPromise.playlist)

    
    const failedPlaylists: PlaylistTransferResult[] = settledPlaylistsToTransfer
        .filter(transferPromise => transferPromise.ok === false)
        .map(p => ({
            status: 'failed',
            sourcePlaylistId: p.source.id,
            sourceName: p.source.name,
            error: p.error
        }))

    const successfulPlaylistsTransferred = await createPlaylists(appleDevToken, mut, appleStorefront, fulfilledTransferPlaylists)

    return [...successfulPlaylistsTransferred, ...failedPlaylists]
}

export const matchTracks = async (devToken: string, mut: string, storefront: string, sourceTracks: TransferTrack[]) => {
    const indexedTracks = sourceTracks.map((track, index) => ({ index, track }))
    const isrcTracks = indexedTracks.filter(({ track }) => track.isrc)
    const searchTracks = indexedTracks.filter(({ track }) => !track.isrc)

    const isrcMatchResults: IndexedTrackMatchResult[] = []
    const searchMatchResults: IndexedTrackMatchResult[] = []

    let irscMatchPayload: AppleSong[] = []

    // GET ISRCMATCH PAYLOAD //
    const isrcUrl = `https://api.music.apple.com/v1/catalog/${storefront}/songs`
    for (let i = 0; i < isrcTracks.length; i+=ISRC_BATCH_SIZE) {
        const batch = isrcTracks.slice(i, i+ISRC_BATCH_SIZE).map(({ track }) => track.isrc)
        const params = new URLSearchParams()
        params.set('filter[isrc]', batch.join(','))

        let trackPayload = await fetchWithAppleAuth<AppleMusicAPIResponse<AppleMusicResource<AppleSongAttributes>>>(devToken, mut, `${isrcUrl}?${params}`)

        if (!trackPayload) continue 
        else irscMatchPayload = [...irscMatchPayload, ...trackPayload.data]
    }

    const isrcGroupMap = groupBy(irscMatchPayload, (song) => song.attributes.isrc)

    // ADD MATCH RESULTS TO ISRCMATCHRESULTS //
    for (const sourceTrackItem of isrcTracks) {
        const sourceTrack = sourceTrackItem.track
        const candidates = isrcGroupMap.get(sourceTrack.isrc ?? '') ?? []

        if (candidates.length === 0) {
            searchTracks.push(sourceTrackItem)
            continue
        }
        const bestCandidate = candidates.reduce((bestSoFar, candidate) => {
            return scoreCandidate(sourceTrack, candidate) > scoreCandidate(sourceTrack, bestSoFar)
                ? candidate
                : bestSoFar
        })

        isrcMatchResults.push({
            index: sourceTrackItem.index,
            source: sourceTrack,
            matched: {
                    id: bestCandidate.id,
                    type: bestCandidate.type,
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

    // GET SEARCHPAYLOAD //
    const searchUrl = `https://api.music.apple.com/v1/catalog/${storefront}/search`
    for (const searchTrackItem of searchTracks) {
        const searchTrack = searchTrackItem.track
        const searchTerms = `${searchTrack.trackName} ${searchTrack.artistNames.join(' ')} ${searchTrack.albumName ?? ''}`
        const params = new URLSearchParams()
        params.set('types', 'songs')
        params.set('term', searchTerms)
        params.set('with', 'topResults')
        params.set('limit', '5')

        let searchPayload = await fetchWithAppleAuth<AppleMusicAPISearchResponse>(devToken, mut, `${searchUrl}?${params}`)
        let songsPayload = searchPayload?.results.songs?.data ?? []

        if (songsPayload.length === 0) {
            console.log(`source: ${searchTrack.trackName} with no track matches`)
            const secondSearchTerms = `${searchTrack.trackName}`
            const secondSearchParams = new URLSearchParams()
            secondSearchParams.set('types', 'songs')
            secondSearchParams.set('term', secondSearchTerms)
            secondSearchParams.set('with', 'topResults')
            secondSearchParams.set('limit', '5')

            // const response = await fetch(`${searchUrl}?${params}`, {
            //     method: 'GET',
            //     headers: {
            //         'Authorization': `Bearer ${devToken}`,
            //         'Music-User-Token': mut
            //     }
            // })
            // await checkAPIResponse(response)

            // searchPayload = await response.json() as AppleMusicAPISearchResponse

            searchPayload = await fetchWithAppleAuth<AppleMusicAPISearchResponse>(devToken, mut, `${searchUrl}?${secondSearchParams}`)
            songsPayload = searchPayload?.results.songs?.data ?? []
        }

        if (songsPayload.length === 0) {
            searchMatchResults.push({
                index: searchTrackItem.index,
                source: searchTrack,
                matched: null,
                matchedBy: 'none',
                confidence: 'none',
            })
        } else {
            const bestCandidate = songsPayload.reduce((bestSoFar, candidate) => {
                return scoreCandidate(searchTrack, candidate) > scoreCandidate(searchTrack, bestSoFar)
                    ? candidate
                    : bestSoFar
            })

            const confidenceScore = scoreCandidate(searchTrack, bestCandidate)
            let confidence = 'none' as 'exact' | 'fuzzy' | 'none'

            if (confidenceScore > 0.85*TOTAL_SCORE) confidence = 'exact'
            else if (confidenceScore > 0.35*TOTAL_SCORE) confidence = 'fuzzy'

            // TESTING LINE HERE
            if (confidence === 'none') console.log(`confidence is none\nBest candidate: ${bestCandidate.attributes.name} by ${bestCandidate.attributes.artistName}\nsource: ${searchTrack.trackName} by ${searchTrack.artistNames}\nscore: ${confidenceScore}`)
            
            searchMatchResults.push({
                    index: searchTrackItem.index,
                    source: searchTrack,
                    matched: confidence === 'none' 
                        ? null 
                        : {
                            id: bestCandidate.id,
                            name: bestCandidate.attributes.name,
                            type: bestCandidate.type,
                            artistName: bestCandidate.attributes.artistName,
                            albumName: bestCandidate.attributes.albumName,
                            durationMs: bestCandidate.attributes.durationInMillis,
                            isrc: bestCandidate.attributes.isrc
                        },
                    matchedBy: confidence === 'none' ? 'none' : 'search',
                    confidence: confidence
            })        
        }

    }

    return [...isrcMatchResults, ...searchMatchResults]
        .sort((a, b) => a.index - b.index)
        .map(({ index: _index, ...result }) => result)
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

/**
 * 
 * @param source source transfer track
 * @param candidate candidate apple song track
 * @returns score that represents how close the candidate is to the original source track
 */
const scoreCandidate = (source: TransferTrack, candidate: AppleSong) => {
    let score = 0

    if (source.durationMs && candidate.attributes.durationInMillis) {
        const diff = Math.abs(source.durationMs - candidate.attributes.durationInMillis)

        if (diff <= 5000) score += TOTAL_SCORE/8
    }

    const sourceTrackName = normalizeString(source.trackName)
    const candTrackName = normalizeString(candidate.attributes.name)
    if (sourceTrackName === candTrackName) score += TOTAL_SCORE/4

    const appleArtists = normalizeArtistString(candidate.attributes.artistName)
    const spotifyArtist = source.artistNames.map(normalizeArtistString)
    if (appleArtists.includes(spotifyArtist[0])) score += TOTAL_SCORE/4


    if (spotifyArtist.length === 1) score += TOTAL_SCORE/8
    else {
        const additionalScoreNorm = TOTAL_SCORE/(8 * (spotifyArtist.length - 1 > 0 ? spotifyArtist.length - 1 : 1))
        const additionalArtistMatches = spotifyArtist.slice(1).filter(artist => appleArtists.includes(artist)).length
        score += additionalArtistMatches * additionalScoreNorm
    }

    const sourceAlbum = normalizeString(source.albumName)
    const candAlbum = normalizeString(candidate.attributes.albumName)
    if (sourceAlbum && candAlbum && sourceAlbum === candAlbum) score += TOTAL_SCORE/4

    return score
}

const normalizeString = (str: string | undefined): string => {
  return (str ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}
const normalizeArtistString = (str: string | undefined): string => {
  return normalizeString(str)
    .replace(/\b(feat|featuring|ft|with)\b\.?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}