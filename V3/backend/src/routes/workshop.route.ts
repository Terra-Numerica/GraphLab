// Imports
import { Hono } from 'hono';
import * as controller from '@/controllers/workshop.controller';

const workshopRoute = new Hono();

workshopRoute.get('/', controller.getWorkshops);
workshopRoute.get('/:id', controller.getWorkshop);
workshopRoute.post('/', controller.addWorkshop);
workshopRoute.put('/:id', controller.editWorkshop);
workshopRoute.delete('/:id', controller.deleteWorkshop);

export default workshopRoute;
