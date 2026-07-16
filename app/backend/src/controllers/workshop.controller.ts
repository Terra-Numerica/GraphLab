// Imports
import { z } from 'zod';
import * as workshopStore from '@/storage/workshopStore';

// Validation schemas
const workshopSchema = z.object({
	coloring: z.object({
		production: z.boolean(),
		development: z.boolean()
	}),
	spanningTree: z.object({
		production: z.boolean(),
		development: z.boolean()
	}),
	railwayMaze: z.object({
		production: z.boolean(),
		development: z.boolean()
	})
});

export const getWorkshops = async (c: any) => {
	try {
		const workshops = await workshopStore.findAllWorkshops();
		return c.json(workshops);
	} catch (error: any) {
		console.error('Error fetching workshops:', error);
		return c.json({ error: error.message }, 500);
	}
};

export const getWorkshop = async (c: any) => {
	try {
		const { id } = c.req.param();
		const workshop = await workshopStore.findWorkshopById(id);
		
		if (!workshop) {
			return c.json({ message: 'Workshop not found' }, 404);
		}
		
		return c.json(workshop);
	} catch (error: any) {
		console.error('Error fetching workshop:', error);
		return c.json({ error: error.message }, 500);
	}
};

export const addWorkshop = async (c: any) => {
	try {
		const body = await c.req.json();
		
		const validatedData = workshopSchema.parse(body);
		
		const workshop = await workshopStore.createWorkshop(validatedData);
		
		return c.json(workshop, 201);
	} catch (error: any) {
		console.error('Error creating workshop:', error);
		
		if (error instanceof z.ZodError) {
			return c.json({ message: 'Invalid input data', errors: error.issues }, 400);
		}
		
		return c.json({ error: error.message }, 500);
	}
};

export const editWorkshop = async (c: any) => {
	try {
		const { id } = c.req.param();
		const body = await c.req.json();
		
		const validatedData = workshopSchema.parse(body);
		
		const updatedWorkshop = await workshopStore.updateWorkshop(id, validatedData);
		
		if (!updatedWorkshop) {
			return c.json({ message: 'Workshop not found' }, 404);
		}
		
		return c.json(updatedWorkshop);
	} catch (error: any) {
		console.error('Error updating workshop:', error);
		
		if (error instanceof z.ZodError) {
			return c.json({ message: 'Invalid input data', errors: error.issues }, 400);
		}
		
		return c.json({ error: error.message }, 500);
	}
};

export const deleteWorkshop = async (c: any) => {
	try {
		const { id } = c.req.param();
		
		const deleted = await workshopStore.deleteWorkshop(id);
		
		if (!deleted) {
			return c.json({ message: 'Workshop not found' }, 404);
		}
		
		return c.json({ message: 'Workshop deleted successfully' });
	} catch (error: any) {
		console.error('Error deleting workshop:', error);
		return c.json({ error: error.message }, 500);
	}
};
