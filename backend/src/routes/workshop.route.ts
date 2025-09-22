// Imports
import * as controller from '@/controllers/workshop.controller';

import { Router } from 'express';

const router = Router();

router.get('/', controller.getWorkshops);
router.get('/:id', controller.getWorkshop);
router.post('/', controller.addWorkshop);
router.put('/:id', controller.editWorkshop);
router.delete('/:id', controller.deleteWorkshop);

// Export
export default router;
