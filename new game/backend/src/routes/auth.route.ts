import express from 'express';
import * as controller from '../controllers/auth.controller';

const router = express.Router();

router.post('/login', controller.login);

export default router; 