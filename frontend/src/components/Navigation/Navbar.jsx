import { useState, useEffect } from 'react';
import '../../styles/Navigation/Navbar.css';

const Navbar = () => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const handleDropdown = (open) => {
		if (window.innerWidth > 768) {
			setIsDropdownOpen(open);
		}
	};

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth > 768) {
				setIsMobileMenuOpen(false);
				setIsDropdownOpen(false);
			}
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<nav className="navbar">
			<button className="hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
				<span className="bar"></span>
				<span className="bar"></span>
				<span className="bar"></span>
			</button>
			<div className={`nav-content${isMobileMenuOpen ? ' open' : ''}`}>
				<div className="nav-left">
					<a href="/" className="nav-link">Accueil</a>
					<div className="dropdown">
						<button
							className="dropdown-trigger"
							onMouseEnter={() => handleDropdown(true)}
							onMouseLeave={() => handleDropdown(false)}
							onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						>
							Ateliers <span className="dropdown-arrow">▼</span>
						</button>
						{isDropdownOpen && (
							<div
								className="dropdown-content"
								onMouseEnter={() => handleDropdown(true)}
								onMouseLeave={() => handleDropdown(false)}
							>
								<a href="/coloration">Coloration des sommets</a>
								<a href="/arbre-couvrant">Arbre Couvrant</a>
							</div>
						)}
					</div>
				</div>
				<div className="nav-center">
					<a href="/" className="logo">
						<span className="logo-text">GraphLab par </span>
						<img src="/logo_tn.png" alt="Terra Numerica Logo" className="logo-img" />
					</a>
				</div>
				<div className="nav-right">
					<button className="admin-btn">Connexion Admin</button>
				</div>
			</div>
		</nav>
	);
};

export default Navbar; 