/** Préfixe de déploiement (ex. /graphlab), aligné sur vite `base` et Traefik PathPrefix. */
export const appBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

/** URL publique d'un fichier du dossier `public/`. */
export function assetUrl(path) {
	if (!path || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
		return path;
	}
	const normalized = path.startsWith('/') ? path.slice(1) : path;
	return `${import.meta.env.BASE_URL}${normalized}`;
}
