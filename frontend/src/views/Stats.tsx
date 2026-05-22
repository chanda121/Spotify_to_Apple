import { useSpotifyUserStore } from '../store/useSpotifyUserStore'
import { BlinkBlur } from 'react-loading-indicators'
import { SideBarMenu } from '../components'


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

    const ARTIST_IMG_SIZE = 150

    const SIDEBAR_SECTIONS = [
        {id: 'user-stats', label: 'User Stats'},
        {id: 'top-tracks', label: 'Top Tracks'},
        {id: 'top-artists', label: 'Top Artists'}
    ]

    return (
        <div>
            <SideBarMenu items={SIDEBAR_SECTIONS}/>
            <div className='max-w-4xl mx-auto flex content-center flex-col space-y-5'>
                <section id='user-stats' key='user-stats' className='py-15'>
                    <h1 className='text-3xl font-bold mb-6 border-b pb-2 border-pink-900/15 dark:border-pink-200/20'>Stats here</h1>
                    {!userLoading &&
                        <div className='stat-card rounded-xl p-4'>
                            {user && 
                            Object.entries(user).filter(([key]) => key !== 'images').map(([key, value]) => (
                                <div key={key} className='flex justify-between py-1 border-b last:border-0 border-pink-900/10 dark:border-pink-200/15'>
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
                        <div className='bg-red-500/10 text-red-400 px-4 py-3 rounded-lg'>
                        Error: {userError}
                        </div>
                    }            
                </section>
                <section id='top-tracks' key='Top-Tracks' className='pb-15'>
                    <h1 className='text-3xl font-bold mb-6 border-b pb-2 border-pink-900/15 dark:border-pink-200/20'>Top Tracks</h1>
                    {!topTracksLoading &&
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            {
                                topTracks.map((track, index) => (
                                    <div key={track.id} className='flex items-center gap-4 p-3 rounded-lg stat-card hover:translate-x-1'>
                                        <span className='w-8 text-2xl font-bold text-pink-900/25 dark:text-pink-100/25'>{index + 1}</span>
                                        <div>
                                            <div className='font-semibold'>{track.name}</div>
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
                        <div className='bg-red-500/10 text-red-400 px-4 py-3 rounded-lg'>
                        Error: {topTracksError}
                        </div>
                    }
                </section>
                <section id='top-artists' key='Top-Artists' className='pb-15'>
                    <h1 className='text-3xl font-bold mb-6 border-b pb-2 border-pink-900/15 dark:border-pink-200/20'>Top Artists</h1>
                    {!topArtistsLoading &&
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            {
                                topArtists.map((artist, index) => (
                                    <div key={artist.id} className='flex items-center gap-4 rounded-xl p-4 stat-card hover:translate-x-1'>

                                        {
                                            artist.images?.length && artist.images[1] &&
                                            <img src={artist.images[1]?.url}
                                                width={ARTIST_IMG_SIZE}
                                                height={ARTIST_IMG_SIZE}
                                                alt={artist.name}
                                                className='rounded-full object-cover'
                                            />
                                            
                                        
                                        }
                                        <div className='content-center font-bold text-2xl'>
                                            <span className='text-pink-900/35 dark:text-pink-100/35 text-sm'>#{index + 1}</span>
                                            <div className='font-bold text-lg'>{artist.name}</div>
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
                        <div className='bg-red-500/10 text-red-400 px-4 py-3 rounded-lg'>
                        Error: {topArtistsError}
                        </div>
                    }
                </section>
            </div>
        </div>
    )
}