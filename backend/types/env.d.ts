declare global {
	namespace NodeJS {
		interface ProcessEnv {
			// Server
			PORT: string;

			// Database
			MONGODB_URL: string;

			// Environment
			NODE_ENV: "development" | "production";

			// Render.com
			FRONTEND_URL: string;
			BACKEND_URL: string;
		}
	}
}

export { };