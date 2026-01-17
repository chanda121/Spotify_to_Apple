import './App.css'
import { Header } from './components/Header'
import { Home, About, Stats, Transfer, Backdrop } from './views'
import { ProtectedRoute } from './auth/ProtectedRoute'

import { BrowserRouter, Route, Routes } from 'react-router-dom'


function App() {
return (
    <BrowserRouter>
     	<Header />
		<Routes>
			<Route path='/' element={<Home />} />
			<Route path='/stats' element={
				<ProtectedRoute>
					<Stats />					
				</ProtectedRoute>
			} />
			<Route path='/transfer-playlist' element={
				<ProtectedRoute>
					<Transfer />
				</ProtectedRoute> 
			} />
			<Route path='backdrop' element={
				<ProtectedRoute>
					<Backdrop/>
				</ProtectedRoute>
			} />
			<Route path='/about' element={<About />} />
      	</Routes>
    </BrowserRouter>
)
}

export default App
