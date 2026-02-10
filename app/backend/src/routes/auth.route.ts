// Imports
import { Hono } from 'hono';
import * as controller from '@/controllers/auth.controller';

const authRoute = new Hono();

authRoute.post('/login', controller.login);

export default authRoute;
