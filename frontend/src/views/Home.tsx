import { redirect_authorize } from '../services/auth'

export function Home() {

return (
    <div className='text-center'>
        <h1 className='mb-4'>Landing!!</h1>
        <button onClick={redirect_authorize}>
            Authorize access haha
        </button>
    </div>
)
}
