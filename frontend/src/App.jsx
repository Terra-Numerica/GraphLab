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
import GraphList from './components/Admin/GraphList';
import Workshops from './components/Admin/Workshops';
import AdminLayout from './components/Admin/AdminLayout';

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

// Layout pour les pages publiques (avec navbar et footer)
function PublicLayout({ children }) {
	return (
		<div className="app">
			<Navbar />
			<main className="main-content">
				{children}
			</main>
			<Footer />
		</div>
	);
}

// Layout pour les pages admin (sans navbar et footer)
function AdminLayoutWrapper({ children }) {
	return (
		<div className="admin-app">
			{children}
		</div>
	);
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
			<Routes>
				{/* Routes publiques avec navbar et footer */}
				<Route path="/*" element={
					<PublicLayout>
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
						</Routes>
					</PublicLayout>
				} />
				
				{/* Routes admin sans navbar et footer */}
				<Route path="/admin/*" element={
					<AdminLayoutWrapper>
						<Routes>
							<Route path="/login" element={<Login />} />
							<Route path="/" element={<RequireAuth><AdminLayout><Dashboard /></AdminLayout></RequireAuth>} />
							<Route path="/graphs" element={<RequireAuth><AdminLayout><GraphList /></AdminLayout></RequireAuth>} />
							<Route path="/workshops" element={<RequireAuth><AdminLayout><Workshops /></AdminLayout></RequireAuth>} />
						</Routes>
					</AdminLayoutWrapper>
				} />
			</Routes>
		</BrowserRouter>
	)
}

export default App;