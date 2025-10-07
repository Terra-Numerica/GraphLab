// Imports
import { Hono } from 'hono';
import * as controller from '@/controllers/graph.controller';

const graphRoute = new Hono();

graphRoute.get('/', controller.getGraphs);
graphRoute.get('/:id', controller.getGraph);
graphRoute.post('/', controller.addGraph);
graphRoute.put('/:id', controller.editGraph);
graphRoute.delete('/:id', controller.deleteGraph);

export default graphRoute;
