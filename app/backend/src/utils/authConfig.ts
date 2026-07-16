export interface AdminConfig {
	username: string;
	password: string;
}

export function getAdminConfig(): AdminConfig {
	return {
		username: process.env.ADMIN_USERNAME!,
		password: process.env.ADMIN_PASSWORD!,
	};
}

export function validateAdminCredentials(username: string, password: string): boolean {
	const admin = getAdminConfig();
	return username === admin.username && password === admin.password;
}
