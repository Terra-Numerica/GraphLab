import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Components => Navigation
import Navbar from './components/Navigation/Navbar';
import Footer from './components/Navigation/Footer';

// Components => Pages
import Home from './components/pages/Home';

// Components => Pages => Coloration
import ColorationMain from './components/pages/Coloration/Main'
import Defi from './components/pages/Coloration/Defi'
import Libre from './components/pages/Coloration/Libre'
import Creation from './components/pages/Coloration/Creation'

// Components => Pages => Arbre Couvrant
import ArbreCouvrantMain from './components/pages/ArbreCouvrant/Main'
import ArbreCouvrantTry from './components/pages/ArbreCouvrant/Try'
import AlgoPage from './components/pages/ArbreCouvrant/AlgoPage'

// Components => Pages => Labyrinthe Voyageur
import RailwayMazeMain from './components/pages/RailwayMaze/Main'
import Penrose from './components/pages/RailwayMaze/Penrose'

// Components => Admin
import Dashboard from './components/Admin/Dashboard';
import Login from './components/Admin/Login';

// Components => Common
import MobileWarning from './components/common/MobileWarning';

// Styles
import './styles/global.css'

/**
 * @description RequireAuth is a component that checks if the user is authenticated
 * @param {Object} param0 - The component to render if the user is authenticated
 * @returns {React.ReactNode} The component to render if the user is authenticated
*/
function RequireAuth({ children }) {
	const location = useLocation();
	const isAuthenticated = !!sessionStorage.getItem('jwt');
	if (!isAuthenticated) {
		return <Navigate to="/admin/login" state={{ from: location }} replace />;
	}
	return children;
}

function App() {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		checkMobile();

		window.addEventListener('resize', checkMobile);

		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	if (isMobile) {
		return <MobileWarning />;
	}

	return (
		<BrowserRouter>
		<div className="app">
			<Navbar />
			<main className="main-content">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/coloration" element={<ColorationMain />} />
						<Route path="/coloration/defi" element={<Defi />} />
						<Route path="/coloration/libre" element={<Libre />} />
						<Route path="/coloration/creation" element={<Creation />} />
						<Route path="/arbre-couvrant" element={<ArbreCouvrantMain />} />
						<Route path="/arbre-couvrant/try" element={<ArbreCouvrantTry />} />
						<Route path="/arbre-couvrant/:algo/:graphId" element={<AlgoPage />} />
						<Route path="/railway-maze" element={<RailwayMazeMain />} />
						<Route path="/railway-maze/penrose" element={<Penrose />} />
						<Route path="/admin/login" element={<Login />} />
						<Route path="/admin" element={<RequireAuth><Dashboard /></RequireAuth>} />
					</Routes>
			</main>
			<Footer />
		</div>
		</BrowserRouter>
	)
}

export default App;