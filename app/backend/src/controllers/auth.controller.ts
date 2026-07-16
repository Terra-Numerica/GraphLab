// Imports
import { generateToken } from '@/utils/jwt';
import { getAdminConfig, validateAdminCredentials } from '@/utils/authConfig';
import { z } from 'zod';

// Validation schemas
const loginSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required')
});

export const login = async (c: any) => {
    try {
        const body = await c.req.json();
        
        const { username, password } = loginSchema.parse(body);

        if (!validateAdminCredentials(username, password)) {
            return c.json({ message: 'Identifiant ou mot de passe invalide' }, 401);
        }

        const admin = getAdminConfig();
        const token = generateToken(admin.username);

        return c.json({
            token,
            user: {
                username: admin.username,
                role: 'admin'
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        
        if (error instanceof z.ZodError) {
            return c.json({ message: 'Invalid input data', errors: error.issues }, 400);
        }
        
        return c.json({ message: 'Internal server error' }, 500);
    }
};
