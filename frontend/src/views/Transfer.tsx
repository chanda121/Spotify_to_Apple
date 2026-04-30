import { useState } from 'react'
import { useAppleStore } from '../store/useAppleStore'
import { useSpotifyUserStore } from '../store/useSpotifyUserStore'
import { useTransferStore } from '../store/useTransferStore'
import MusicalNoteIcon from '../assets/musical-note.svg'
import type { SpotifyPlaylist } from '@shared/types/spotify'

type statusMessage = {
    id: string,
    text: string,
    type: 'info' | 'success' | 'error'
}

export function Transfer() {
    const [statusMessage, setStatusMessage] = useState<statusMessage[]>([])
    const [confirmationModalOpen, setConfirmationModalOpen] = useState<boolean>(false)
    const [isTranferring, setIsTransferring] = useState<boolean>(false)

    const PLAYLIST_IMG_SIZE = 60

    const authorize = useAppleStore(state => state.authorize)
    const isMusicKitAuthorized = useAppleStore(state => state.isAuthorized)

    const spotifyPlaylists = useSpotifyUserStore(state => state.playlists)
    const refreshPlaylists = useSpotifyUserStore(state => state.fetchPlaylists)

    const togglePlaylist = useTransferStore(state => state.togglePlaylist)
    const toggleSelectedPlaylistId = useTransferStore(state => state.toggleSelectedPlaylistId)
    const playlistsToTransfer = useTransferStore(state => state.playlistsToTransfer)
    const selectedPlaylistIds = useTransferStore(state => state.selectedPlaylistIds)
    const clearAllSelectedPlaylists = useTransferStore(state => state.clearAll)
    const conformPlaylists = useTransferStore(state => state.conformPlaylists)
    const test = useTransferStore(state => state.test)

    const addStatusMessage = (text: string, type: statusMessage['type'] = 'info') => {
        const id = crypto.randomUUID()

        setStatusMessage(msgs => [...msgs, {id, text, type}])

        setTimeout(() => {
            setStatusMessage(msgs => msgs.filter(msg => msg.id !== id))
        }, 3000)
    }

    const handleSelect = async (playlist: SpotifyPlaylist) => {
        toggleSelectedPlaylistId(playlist.id)
        console.log(selectedPlaylistIds)
        await togglePlaylist(playlist)
    }

    const handleTransferClick = () => {
        // check if all playlists are loaded
        // check if number selected between 1 and 5
        let hasErrors = false

        if (selectedPlaylistIds.length === 0) {
            addStatusMessage('No playlists selected! >=[', 'error')
            hasErrors = true
        }
        if (selectedPlaylistIds.length > 5) {
            addStatusMessage('More than 5 playlists selected!', 'error')
            hasErrors = true
        }

        if (!hasErrors) setConfirmationModalOpen(true)
    }
    const handleConfirmTransferClick = () => {
        conformPlaylists()
        test()
    }
    
    const clearAll = () => {
        clearAllSelectedPlaylists()
    }

    const displayPlaylists = () => {
        if (!spotifyPlaylists.length) {
            return <div>No Playlists Yet</div>
        }
        return spotifyPlaylists.map((playlist) => {
            const isSelected = selectedPlaylistIds.includes(playlist.id)

            return (
                <div className={`flex gap-2 items-center p-2 rounded-lg row-hover hover:translate-x-4 hover:cursor-pointer ${isSelected ? 'selectable-row' : ''}`}
                    key={playlist.id}
                    id={playlist.id}
                    onClick={async () => {
                        await handleSelect(playlist)
                    }}
                    >
                    {
                        playlist.images ? 
                        <img src={playlist.images[0]?.url}
                            width={PLAYLIST_IMG_SIZE}
                            height={PLAYLIST_IMG_SIZE}
                            alt={playlist.name}
                            className='rounded-md object-cover'
                            />
                        :
                        <div className='bg-gray-100 rounded-md object-cover flex justify-center items-center'
                            style={{ width: PLAYLIST_IMG_SIZE, height: PLAYLIST_IMG_SIZE }}
                            >
                            <img src={MusicalNoteIcon} style={{width: PLAYLIST_IMG_SIZE/2, height: PLAYLIST_IMG_SIZE/2}}/>
                        </div>
                    }
                    <div className='font-bold text-sm truncate'>{playlist.name}</div>
                </div>
            )            
        })
    }

    const displayPlaylistsToBeTransferred = () => {
        const toBeTransferred = playlistsToTransfer.filter(playlist => selectedPlaylistIds.includes(playlist.id))
        return toBeTransferred.map(playlist => {
            return (
                <div 
                    className='flex gap-1 items-center p-2'
                    key={playlist.id}
                    id={playlist.id}
                    >
                    <div className='font-bold text-sm truncate'>{playlist.name}</div>
                </div>                
            )
        })
    }

    return (
        <>
            {
                confirmationModalOpen && 
                <div 
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
                    onClick={() => {
                        if (!isTranferring) setConfirmationModalOpen(false)
                    }}
                    >
                    <div
                        className='w-full max-w-lg rounded-lg p-6 shadow-xl border-blue-100 border app-surface'
                        onClick={event => event.stopPropagation()}>
                        <h2 className='text-xl font-bold'>Confirm Transfer</h2>

                        <div>
                            {displayPlaylistsToBeTransferred()}
                        </div>

                        <div className='mt-6 flex justify-end gap-3'>
                            <button onClick={() => setConfirmationModalOpen(false)}>
                                Cancel
                            </button>
                            <button onClick={async () => {
                                handleConfirmTransferClick()
                            }}>
                                Confirm Transfer
                            </button>
                        </div>
                        
                    </div>
                </div>
            }
            <div className='flex flex-col gap-2'>
                <div className='flex flex-col font-bold text-2xl justify-center items-center'>
                    <div>This is the transfer!!</div>
                    <div className='text-lg'>Select playlists to transfer below</div>
                </div>
                {
                    !isMusicKitAuthorized &&
                    <div>
                        <h2>Authorize Apple Music</h2>
                        <button onClick={async () => {
                            await authorize()
                        }}>Authorize Apple</button>
                    </div>
                }
                {
                    isMusicKitAuthorized &&
                    <div className='flex justify-between top-4 sticky z-10'>
                        <div>
                            <div className='flex gap-5'>
                                <button onClick={async () => {
                                    addStatusMessage('Playlists refreshed')
                                    clearAll()
                                    await refreshPlaylists()
                                }}>Refresh Playlists</button>
                                <button onClick={() => {
                                    clearAll()
                                }}> Clear Selection </button>
                            </div>
                            
                            <div className='absolute top-full right-0 mt-2 flex flex-col gap-2 items-end'>
                                {
                                    statusMessage.map(msg => (
                                        <div key={msg.id} className={`text-sm font-medium whitespace-nowrap ${msg.type === 'error' ? 'text-red-500' : ''}`}>
                                            {msg.text}
                                        </div>
                                    ))                                      
                                }
                                
                            </div>
                        </div>

                        <button onClick={() => {
                            handleTransferClick()
                        }}>Transfer Playlists</button>
                    </div>
                }

                <div className='flex gap-1'>
                    <div></div>
                    <div id='spotify-playlist-col' className='flex flex-col gap-2 grow p-2'>
                        {displayPlaylists()}
                    </div>
                </div>
            </div>
        </>

    )
}