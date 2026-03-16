import { useAuth } from '../auth/authContext'

export function Home() {
    const { status, login } = useAuth()

    

    return (
        <div className='text-center'>
            <div className='section1 flex justify-center gap-4 items-center'>
                <h1 className='mb-4'>Landing!!</h1>
                { status === 'loggedIn' && <p>Logged in!!</p> }
                { status !== 'loggedIn' &&
                    <button onClick={login}>
                        Authorize access haha
                    </button>
                }
            </div>
            <div className='section2 flex gap-4 outline-blue-100'>
                <div className='flex outline-1 flex-col w-1/2 text-left p-4'>
                    <h2 className='font-extrabold my-1'>
                        Application to see some of your favourite songs and Artists on Spotify!
                    </h2>
                    <h2>
                        Also includes a playlist transfer to and from Apple Music! (Not yet), 
                        and a backdrop with a clock and currently playing music synced with Spotify!
                    </h2>
                </div>
                <div className='flex outline-1 grow'>Authorize access so the app can see your Spotify Data!</div>        
            </div>

        </div>
    )
}
