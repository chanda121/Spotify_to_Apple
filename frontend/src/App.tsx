import './App.css'
import { Header } from './components/Header'
import { Home, About, Stats, Transfer } from './views'

import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App() {
return (
    <BrowserRouter>
     	<Header />
		<Routes>
			<Route path='/' element={<Home />} />
			<Route path='/stats' element={<Stats />} />
			<Route path='/transfer-playlist' element={<Transfer />} />
			<Route path='/about' element={<About />} />
      	</Routes>
    </BrowserRouter>
)
}

export default App
