import { Request, Response } from 'express';
import Admin from '../models/admin.model';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcrypt';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        // Find admin by username
        const admin = await Admin.findOne({ username });
        if (!admin) {
            res.status(401).json({ message: 'Identifiant invalide' });
            return;
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Mot de passe invalide' });
            return;
        }

        // Generate JWT token
        const token = generateToken(admin._id.toString());

        res.json({
            token,
            user: {
                id: admin._id,
                username: admin.username,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}; 