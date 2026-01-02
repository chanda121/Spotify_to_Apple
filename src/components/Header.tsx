import { ThemeToggle } from "./ThemeToggle"
import { Link } from 'react-router-dom'

export default function Header() {
return (
<header className='header'>
	<div className='logo'>
		<Link to='/'>DANNY'S SPOTIFY VIEWER</Link>
	</div>
	<div className='header-menu-items'>
		<nav>
			<button>
				<Link to='/stats'>Stats</Link>
			</button>
			<button>
				<Link to='/transfer-playlist'>Transfer Playlist</Link>
			</button>
			<button>
				<Link to='/about'>About</Link>
			</button>
		</nav>
		<ThemeToggle/>
	</div>
</header>

)
}