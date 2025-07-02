// Imports
import * as controller from '@/controllers/auth.controller';

import { Router } from 'express';

const router = Router();

router.post('/login', controller.login);

export default router; 