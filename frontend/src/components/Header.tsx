import { useState, useRef, useEffect } from "react"
import { ThemeToggle } from "./ThemeToggle"
import { headerNavItems } from "../data/header-nav-links"
import { Link } from "react-router-dom"
import { useAuth } from '../auth/authContext'

export function Header() {
	const [hamburgerOpen, setHamburgerOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement | null>(null)
	const { status, logout } = useAuth()

	const toggleHamburger = () => {
		setHamburgerOpen(!hamburgerOpen)
	}
	const closeHamburger = () => {
		setHamburgerOpen(false)
	}

	useEffect(() => {
		if (!hamburgerOpen) return

		const handleClickOutside = (event: MouseEvent) => {
			if (!dropdownRef.current) return

			if (!dropdownRef.current.contains(event.target as Node)) {
				closeHamburger()
			}
		}
		document.addEventListener('mousedown', handleClickOutside)

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [hamburgerOpen])


	const listItemsNav = headerNavItems.map(nav_item => 
		<Link onClick={closeHamburger} className='header-nav-link' key={nav_item.id} to={nav_item.link}>{nav_item.label}</Link>
	)
	let listItems = null
	
	if (status === 'logged_in') {
		listItems = [...listItemsNav, 
			<button key='logout-button' className='text-sm py-0.5 'onClick={logout}>Logout</button>
		]		
	} else {
		listItems = [...listItemsNav]
	}


return (
<header className='header'>
	<div className='logo'>
		<Link to='/'>DANNY'S SPOTIFY VIEWER</Link>
	</div>
	<div className='header-menu-items'>
		<nav className='p-2'>
			{listItems}
		</nav>
		<ThemeToggle/>
	</div>
	<div className='header-hamburger-button' ref={dropdownRef}>
		<button onClick={toggleHamburger}>
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