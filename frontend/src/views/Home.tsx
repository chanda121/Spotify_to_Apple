import { useAuth } from '../auth/authContext'

export function Home() {
    const { status, login } = useAuth()

return (
    <div className='text-center'>
        <h1 className='mb-4'>Landing!!</h1>
        { status === 'logged_in' && <p>Logged in!!</p> }
        { status !== 'logged_in' &&
            <button onClick={login}>
                Authorize access haha
            </button>
        }
    </div>
)
}
