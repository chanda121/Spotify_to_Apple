import ThemeToggle from "./ThemeToggle"

export default function Header() {
  return (
  <header className='header'>
    <div className='logo'>
      <span>DANNY'S SPOTIFY VIEWER</span>
    </div>
    <div className='header-menu-items'>
      <button>
        Stats
      </button>
      <button>
        Transfer Playlist
      </button>
      <button>
        about
      </button>
      <ThemeToggle/>
    </div>
  </header>

)
}