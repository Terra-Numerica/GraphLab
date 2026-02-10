// Imports
import { generateToken } from '@/utils/jwt';
import { z } from 'zod';

import Admin from '@/models/admin.model';
import bcrypt from 'bcrypt';

// Validation schemas
const loginSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required')
});

export const login = async (c: any) => {
    try {
        const body = await c.req.json();
        
        // Validate input
        const { username, password } = loginSchema.parse(body);

        // Find admin by username
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return c.json({ message: 'Identifiant invalide' }, 401);
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, admin.password || '');
        if (!isValidPassword) {
            return c.json({ message: 'Mot de passe invalide' }, 401);
        }

        // Generate JWT token
        const token = generateToken(admin._id.toString());

        return c.json({
            token,
            user: {
                id: admin._id,
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
