// Imports
import * as controller from '@/controllers/graph.controller';

import { Router } from 'express';

const router = Router();

router.get('/', controller.getGraphs);
router.get('/:id', controller.getGraph);
router.post('/', controller.addGraph);
router.put('/:id', controller.editGraph);
router.delete('/:id', controller.deleteGraph);

// Export
export default router;