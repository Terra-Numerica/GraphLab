import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth > 768) {
				setIsMobileMenuOpen(false);
			}
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		const checkAuth = () => {
			const token = sessionStorage.getItem('jwt');
			setIsAuthenticated(!!token);
		};
		checkAuth();
		window.addEventListener('authChanged', checkAuth);
		return () => window.removeEventListener('authChanged', checkAuth);
	}, []);

	const handleLogout = () => {
		sessionStorage.removeItem('jwt');
		setIsAuthenticated(false);
		navigate('/');
	};

	return (
		<nav className="sticky top-0 z-50 w-full border-b border-darkBlue bg-darkBlue text-white">
			<div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3 sm:px-6 md:px-8 md:py-4">
				{/* Mobile: Hamburger + Logo */}
				<div className="flex items-center gap-3 md:hidden">
					<button
						className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-lightBlue/60 transition-colors"
						onClick={() => setIsMobileMenuOpen((v) => !v)}
						aria-label="Ouvrir le menu"
						aria-expanded={isMobileMenuOpen}
					>
						<span className={`block h-0.5 w-5 bg-white transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : 'mb-1.5'}`}></span>
						<span className={`block h-0.5 w-5 bg-white transition-all ${isMobileMenuOpen ? 'opacity-0' : 'mb-1.5'}`}></span>
						<span className={`block h-0.5 w-5 bg-white transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
					</button>
					<a href="/" className="flex items-center gap-1.5">
						<span className="text-base font-semibold text-white">GraphLab par</span>
						<img src="/logo_tn.png" alt="Terra Numerica Logo" className="h-7 w-auto" />
					</a>
				</div>

				{/* Desktop: Left Nav */}
				<div className="hidden md:flex md:items-center md:gap-6">
					<a href="/" className="text-lg font-medium hover:text-lightBlue transition-colors">
						Accueil
					</a>

					{/* Dropdown (hover desktop) - avec zone de transition invisible */}
					<div className="relative group">
						<button
							className="inline-flex items-center gap-1.5 text-lg font-medium hover:text-lightBlue transition-colors"
							aria-haspopup="menu"
							aria-expanded="false"
						>
							Ateliers
							<svg
								className="h-4 w-4 transition-transform group-hover:rotate-180"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
							</svg>
						</button>

						{/* Zone invisible pour permettre le passage du curseur */}
						<div className="absolute left-0 top-full h-2 w-full"></div>

						{/* Dropdown Menu */}
						<div className="absolute left-0 top-full pt-2 w-56 opacity-0 pointer-events-none translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
							<div className="rounded-xl border border-grey/30 bg-white text-astro shadow-lg">
								<a href="/coloration" className="block rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
									Coloration des sommets
								</a>
								<a href="/arbre-couvrant" className="block rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
									Arbre Couvrant
								</a>
								<a href="/railway-maze" className="block rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
									Labyrinthe Voyageur
								</a>
							</div>
						</div>
					</div>
				</div>

				{/* Desktop: Center Logo */}
				<div className="hidden md:flex md:absolute md:left-1/2 md:-translate-x-1/2">
					<a href="/" className="flex items-center gap-2">
						<span className="text-lg font-semibold text-white">GraphLab par</span>
						<img src="/logo_tn.png" alt="Terra Numerica Logo" className="h-10 w-auto" />
					</a>
				</div>

				{/* Desktop: Right actions */}
				<div className="hidden md:flex md:items-center md:gap-3">
					{isAuthenticated ? (
						<>
							<a
								href="/admin"
								className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-2.5 text-base font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-lightBlue/50 transition-colors"
							>
								Tableau de bord
							</a>
							<button
								onClick={handleLogout}
								className="inline-flex items-center justify-center rounded-lg bg-lightBlue px-5 py-2.5 text-base font-semibold text-darkBlue shadow hover:bg-blueHover focus:outline-none focus:ring-2 focus:ring-lightBlue/50 transition-colors"
							>
								Déconnexion
							</button>
						</>
					) : (
						<a
							href="/admin"
							className="inline-flex items-center justify-center rounded-lg border-2 border-white px-5 py-2.5 text-base font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-lightBlue/50 transition-colors"
						>
							Connexion Admin
						</a>
					)}
				</div>
			</div>

			{/* Mobile panel */}
			{isMobileMenuOpen && (
				<div className="md:hidden border-t border-white/20 bg-darkBlue text-white">
					<div className="px-4 py-4">
						<div className="flex flex-col gap-3">
							<a href="/" className="py-2.5 text-lg font-medium hover:text-lightBlue transition-colors">
								Accueil
							</a>

							{/* Dropdown mobile (accordéon) */}
							<details className="group">
								<summary className="flex cursor-pointer list-none items-center justify-between py-2.5 text-lg font-medium hover:text-lightBlue transition-colors">
									<span>Ateliers</span>
									<svg
										className="h-4 w-4 transition-transform group-open:rotate-180"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
									</svg>
								</summary>
								<div className="mt-1 ml-3 flex flex-col gap-1">
									<a href="/coloration" className="rounded-lg px-3 py-2.5 text-base hover:bg-white/10 transition-colors">
										Coloration des sommets
									</a>
									<a href="/arbre-couvrant" className="rounded-lg px-3 py-2.5 text-base hover:bg-white/10 transition-colors">
										Arbre Couvrant
									</a>
									<a href="/railway-maze" className="rounded-lg px-3 py-2.5 text-base hover:bg-white/10 transition-colors">
										Labyrinthe Voyageur
									</a>
								</div>
							</details>

							<div className="pt-3 border-t border-white/20">
								{isAuthenticated ? (
									<div className="flex flex-col gap-2.5">
										<a
											href="/admin"
											className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-2.5 text-base font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-lightBlue/50 transition-colors"
										>
											Tableau de bord
										</a>
										<button
											onClick={handleLogout}
											className="inline-flex w-full items-center justify-center rounded-lg bg-lightBlue px-5 py-2.5 text-base font-semibold text-darkBlue shadow hover:bg-blueHover focus:outline-none focus:ring-2 focus:ring-lightBlue/50 transition-colors"
										>
											Déconnexion
										</button>
									</div>
								) : (
									<a
										href="/admin"
										className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white px-5 py-2.5 text-base font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-lightBlue/50 transition-colors"
									>
										Connexion Admin
									</a>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
