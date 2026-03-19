import { useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { headerNavItems } from '../config/header-nav-links'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/authContext'

export function Header() {
	const [hamburgerOpen, setHamburgerOpen] = useState(false)
	const { status, logout } = useAuth()

	const closeHamburger = () => {
		setHamburgerOpen(false)
	}

	const listItemsNav = headerNavItems.map(nav_item => 
		<Link onClick={closeHamburger} className='header-nav-link' key={nav_item.id} to={nav_item.link}>{nav_item.label}</Link>
	)
	let listItems = null
	
	if (status === 'loggedIn') {
		listItems = [...listItemsNav, 
			<button key='logout-button' onClick={logout}>Logout</button>
		]		
	} else {
		listItems = [...listItemsNav]
	}


return (
<header className='header'>
	<div className='logo'>
		<Link to='/'>DANNY'S SPOTIFY VIEWER</Link>
	</div>
	<div className='lg:flex hidden'>
		<nav className='p-2'>
			{listItems}
		</nav>
		<ThemeToggle/>
	</div>
	<div className='flex lg:hidden relative' 
		 onMouseEnter={()=>setHamburgerOpen(true)}
		 onMouseLeave={()=>setHamburgerOpen(false)}>
		<button>
			Hamburger
		</button>
		{
			hamburgerOpen &&
			<div className='dropdown' >
				{listItems}
				<ThemeToggle/>
			</div>
		}			
	</div>
	


</header>

)
}