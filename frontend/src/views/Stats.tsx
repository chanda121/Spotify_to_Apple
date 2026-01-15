import { useSpotifyUserStore } from '../store/useSpotifyUserStore'
import { BlinkBlur } from 'react-loading-indicators'


export function Stats() {
    const user = useSpotifyUserStore((state) => state.user)
    const topTracks = useSpotifyUserStore((state) => state.topTracks)
    const topArtists = useSpotifyUserStore((state) => state.topArtists)

    const userError = useSpotifyUserStore((state) => state.userError)
    const userLoading = useSpotifyUserStore((state) => state.isLoadingUser)

    const topTracksError = useSpotifyUserStore((state) => state.topTracksError)
    const topTracksLoading = useSpotifyUserStore((state) => state.isLoadingTopTracks)

    const topArtistsError = useSpotifyUserStore((state) => state.topArtistsError)
    const topArtistsLoading = useSpotifyUserStore((state) => state.isLoadingTopArtists)


return(
    <div className='max-w-4xl mx-auto flex content-center flex-col space-y-5'>
        <div key='user-stats'>
            <h1 className="text-3xl font-bold mb-6 border-b pb-2 border-black/40 dark:border-white/20">Stats here</h1>
            {!userLoading &&
                <div>
                    {user && 
                    Object.entries(user).map(([key, value]) => (
                        <div key={key} className='flex justify-between py-1 border-b last:border-0 border-black/20 dark:border-white/20'>
                            <span className='capitalize'>{key}</span>
                            <span className='font-medium'>{value}</span>
                        </div>
                    ))
                    }           
                </div>        
            }
            {userLoading &&
                <div className='flex items-center justify-center py-12'>
                    <BlinkBlur size='small'/>
                </div>
            }
            {userError &&
                <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-lg">
                Error: {userError}
                </div>
            }            
        </div>
        <div key='Top-Tracks'>
            <h1 className="text-3xl font-bold mb-6 border-b pb-2 border-black/40 dark:border-white/20">Top Tracks</h1>
            {!topTracksLoading &&
                <div className='space-y-1'>
                    {
                        topTracks.map((track, index) => (
                            <div key={track.id} className='flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900/10 dark:hover:bg-white/10 transition-colors'>
                                <span className="w-8 text-2xl font-bold text-black/30 dark:text-white/30">{index + 1}</span>
                                <div>
                                    <div className='font-semibold it'>{track.name}</div>
                                    <div className='italic'>{track.artists.map(a => a.name).join(', ')}</div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            }
            {topTracksLoading &&
                <div className='flex items-center justify-center py-12'>
                    <BlinkBlur size='small'/>
                </div>            }
            {topTracksError &&
                <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-lg">
                Error: {topTracksError}
                </div>
            }
        </div>
        <div key='Top-Artists'>
            <h1 className="text-3xl font-bold mb-6 border-b pb-2 border-black/40 dark:border-white/20">Top Artists</h1>
            {!topArtistsLoading &&
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    {
                        topArtists.map((artist, index) => (
                            <div key={artist.id} className='flex items-center gap-4 rounded-xl p-4 hover:bg-gray-900/10 dark:hover:bg-white/10 transition-colors'>
                                {
                                    artist.images?.length && artist.images[2] &&
                                    <img src={artist.images[2]?.url}
                                        width={artist.images[2]?.width} 
                                        height={artist.images[2]?.height}
                                        alt={artist.name}
                                        className='rounded-full object-cover'
                                    />
                                
                                }
                                <div className='content-center font-bold text-2xl'>
                                    <span className="text-black/40 dark:text-white/40 text-sm">#{index + 1}</span>
                                    <div className="font-bold text-lg">{artist.name}</div>
                                </div>
                                

                            </div>
                        ))
                    }
                </div>
            }
            {topArtistsLoading &&
                <div className='flex items-center justify-center py-12'>
                    <BlinkBlur size='small'/>
                </div>
            }
            {topArtistsError &&
                <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-lg">
                Error: {topArtistsError}
                </div>
            }
        </div>

        


    </div>
)
}