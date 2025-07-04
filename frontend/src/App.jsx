import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Components => Navigation
import { Navbar } from './components/Navigation/Navbar'
import { Footer } from './components/Navigation/Footer'

// Components => Pages
import Home from './components/pages/Home'
import ArbreCouvrantMain from './components/pages/ArbreCouvrant/Main'
import ArbreCouvrantTry from './components/pages/ArbreCouvrant/Try'

// Components => Pages => Coloration
import ColorationMain from './components/pages/Coloration/Main'
import Defi from './components/pages/Coloration/Defi'
import Libre from './components/pages/Coloration/Libre'
import Creation from './components/pages/Coloration/Creation'

// Components => Pages => Arbre Couvrant
import ArbreCouvrantMain from './components/pages/ArbreCouvrant/Main'
import ArbreCouvrantTry from './components/pages/ArbreCouvrant/Try'
import AlgoPage from './components/pages/ArbreCouvrant/AlgoPage'

// Components => Admin
import Dashboard from './components/Admin/Dashboard';
import Login from './components/Admin/Login';

// Styles
import './styles/global.css'

export const App = () => (
	<BrowserRouter>
		<div className="app">
			<Navbar />
			<main className="main-content">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/coloration">
						<Route index element={<ColorationMain />} />
						<Route path="defi" element={<Defi />} />
						<Route path="libre" element={<Libre />} />
						<Route path="creation" element={<Creation />} />
					</Route>
					<Route path="/arbre-couvrant">
						<Route index element={<ArbreCouvrantMain />} />
						<Route path="try" element={<ArbreCouvrantTry />} />
						<Route path="algo/:algo/:graphId" element={<AlgoPage />} />
					</Route>
					<Route path="/admin/login" element={<Login />} />
					<Route path="/admin" element={<RequireAuth />}>
						<Route index element={<Dashboard />} />
					</Route>
				</Routes>
			</main>
			<Footer />
		</div>
	</BrowserRouter>
)
