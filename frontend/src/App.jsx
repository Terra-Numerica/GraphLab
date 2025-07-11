import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

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

// Components => Admin
import Dashboard from './components/Admin/Dashboard';
import Login from './components/Admin/Login';

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