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
		<nav className="sticky top-0 z-50 w-full border-b border-darkBlue bg-darkBlue text-white text-base md:text-xl">
			<div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3 sm:px-6 md:px-8">
				{/* Left: Logo */}
				<a href="/" className="flex items-center gap-2">
					<span className="text-base font-semibold text-white md:text-xl">GraphLab par</span>
					<img src="/logo_tn.png" alt="Terra Numerica Logo" className="h-8 w-auto md:h-12" />
				</a>

				{/* Mobile hamburger */}
				<button
					className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-lightBlue/60"
					onClick={() => setIsMobileMenuOpen((v) => !v)}
					aria-label="Ouvrir le menu"
					aria-expanded={isMobileMenuOpen}
				>
					<span className="mb-1.5 block h-0.5 w-5 bg-white"></span>
					<span className="mb-1.5 block h-0.5 w-5 bg-white"></span>
					<span className="block h-0.5 w-5 bg-white"></span>
				</button>

				{/* Desktop Nav */}
				<div className="hidden md:flex md:items-center md:gap-8">
					<div className="flex items-center gap-4">
						<a href="/" className="leading-none hover:text-lightBlue transition">
							Accueil
						</a>

						{/* Dropdown (hover desktop) */}
						<div className="relative group leading-none after:absolute after:left-0 after:top-full after:h-2 after:w-full after:content-['']">
							<button
								className="inline-flex items-center leading-none hover:text-lightBlue transition"
								aria-haspopup="menu"
								aria-expanded="false"
							>
								Ateliers
								<svg
									className="ml-1 inline-block h-3 w-3 align-middle transition-transform group-hover:rotate-180"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
								</svg>
							</button>

							{/* Menu : collé au trigger, sans décalage vertical ; zone tampon via after: sur le parent */}
							<div
								className="
                  pointer-events-none absolute left-0 top-full w-64
                  rounded-xl border border-grey/30 bg-white text-astro shadow-lg
                  opacity-0 translate-y-1 transition
                  group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
                "
								role="menu"
							>
								<a href="/coloration" className="block rounded-lg px-3 py-2 text-base hover:bg-gray-50">
									Coloration des sommets
								</a>
								<a href="/arbre-couvrant" className="block rounded-lg px-3 py-2 text-base hover:bg-gray-50">
									Arbre Couvrant
								</a>
								<a href="/railway-maze" className="block rounded-lg px-3 py-2 text-base hover:bg-gray-50">
									Labyrinthe Voyageur
								</a>
							</div>
						</div>
					</div>

					{/* Right actions */}
					<div className="flex items-center gap-3">
						{isAuthenticated ? (
							<>
								<a
									href="/admin"
									className="inline-flex items-center justify-center rounded-xl border border-white/30 px-4 py-2 font-semibold hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-lightBlue/50"
								>
									Tableau de bord
								</a>
								<button
									onClick={handleLogout}
									className="inline-flex items-center justify-center rounded-xl bg-lightBlue px-4 py-2 font-semibold text-darkBlue shadow hover:bg-blueHover focus:outline-none focus:ring-2 focus:ring-lightBlue/50"
								>
									Déconnexion
								</button>
							</>
						) : (
							<a
								href="/admin"
								className="inline-flex flex-1 px-6 py-3 text-[1.1rem] text-white border-2 border-white rounded-xl cursor-pointer text-center no-underline transition-colors duration-200 font-medium"
							>
								Connexion Admin
							</a>
						)}
					</div>
				</div>
			</div>

			{/* Mobile panel */}
			{isMobileMenuOpen && (
				<div className="md:hidden border-t border-white/20 bg-darkBlue text-white">
					<div className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 md:px-8">
						<div className="flex flex-col gap-4">
							<a href="/" className="hover:text-lightBlue transition">
								Accueil
							</a>

							{/* Dropdown mobile (accordéon) */}
							<details className="group">
								<summary className="flex cursor-pointer list-none items-center justify-between hover:text-lightBlue">
									<span>Ateliers</span>
									<svg
										className="ml-2 h-3 w-3 transition-transform group-open:rotate-180"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
									</svg>
								</summary>
								<div className="mt-2 ml-3 flex flex-col gap-1">
									<a href="/coloration" className="rounded-lg px-2 py-1 text-base hover:bg-white/10">
										Coloration des sommets
									</a>
									<a href="/arbre-couvrant" className="rounded-lg px-2 py-1 text-base hover:bg-white/10">
										Arbre Couvrant
									</a>
									<a href="/railway-maze" className="rounded-lg px-2 py-1 text-base hover:bg-white/10">
										Labyrinthe Voyageur
									</a>
								</div>
							</details>

							<div className="pt-2">
								{isAuthenticated ? (
									<div className="flex flex-col gap-2">
										<a
											href="/admin"
											className="inline-flex items-center justify-center rounded-xl border border-white/30 px-4 py-2 font-semibold hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-lightBlue/50"
										>
											Tableau de bord
										</a>
										<button
											onClick={handleLogout}
											className="inline-flex w-full items-center justify-center rounded-xl bg-lightBlue px-4 py-2 font-semibold text-darkBlue shadow hover:bg-blueHover focus:outline-none focus:ring-2 focus:ring-lightBlue/50"
										>
											Déconnexion
										</button>
									</div>
								) : (
									<a
										href="/admin"
										className="inline-flex w-full items-center justify-center rounded-xl bg-lightBlue px-4 py-2 font-semibold text-darkBlue shadow hover:bg-blueHover focus:outline-none focus:ring-2 focus:ring-lightBlue/50"
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
