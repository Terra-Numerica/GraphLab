import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navigation/Navbar'
import Footer from './components/Navigation/Footer'
import Home from './components/pages/Home'
import ArbreCouvrantMain from './components/pages/ArbreCouvrant/Main'
import ArbreCouvrantTry from './components/pages/ArbreCouvrant/Try'
import ColorationMain from './components/pages/Coloration/Main'
import Defi from './components/pages/Coloration/Defi'
import Libre from './components/pages/Coloration/Libre'
import Creation from './components/pages/Coloration/Creation'
import AlgoPage from './components/pages/ArbreCouvrant/AlgoPage';
import Dashboard from './components/Admin/Dashboard';
import Login from './components/Admin/Login';
import './styles/global.css'

function RequireAuth({ children }) {
	const location = useLocation();
	const isAuthenticated = !!localStorage.getItem('jwt');
	if (!isAuthenticated) {
		return <Navigate to="/admin/login" state={{ from: location }} replace />;
	}
	return children;
}

function App() {
	return (
		<Router>
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
		</Router>
	)
}

export default App;