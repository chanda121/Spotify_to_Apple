import { ThemeToggle } from "./ThemeToggle"
import { Link } from 'react-router-dom'

export default function Header() {
return (
<header className='header'>
	<div className='logo'>
		<Link to='/'>DANNY'S SPOTIFY VIEWER</Link>
	</div>
	<div className='header-menu-items'>
		<nav className='p-2'>
			<Link className='header-nav-link' to='/stats'>Stats</Link>
			<Link className='header-nav-link' to='/transfer-playlist'>Transfer Playlist</Link>
			<Link className='header-nav-link' to='/about'>About</Link>
		</nav>
		<ThemeToggle/>
	</div>
</header>

)
}