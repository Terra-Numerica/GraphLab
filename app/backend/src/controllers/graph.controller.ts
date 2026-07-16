// Imports
import { z } from 'zod';
import * as graphStore from '@/storage/graphStore';

// Validation schemas
const graphSchema = z.object({
	name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom ne peut pas dépasser 50 caractères'),
	data: z.object({
		nodes: z.array(z.any()),
		edges: z.array(z.any())
	}),
	workshopData: z.object({
		coloring: z.object({
			enabled: z.boolean(),
			difficulty: z.string().optional(),
			optimalCount: z.number().optional(),
			tabletCounts: z.record(z.string(), z.number()).optional()
		}).optional(),
		spanningTree: z.object({
			enabled: z.boolean()
		}).optional(),
		railwayMaze: z.object({
			enabled: z.boolean()
		}).optional()
	}).optional()
});

export const getGraphs = async (c: any) => {
	try {
		const graphs = await graphStore.findAllGraphs();
		return c.json(graphs);
	} catch (error: any) {
		console.error('Error fetching graphs:', error);
		return c.json({ error: error.message || 'Unknown error' }, 500);
	}
};

export const getGraph = async (c: any) => {
	try {
		const { id } = c.req.param();
		const graph = await graphStore.findGraphById(id);
		
		if (!graph) {
			return c.json({ message: 'Graph not found' }, 404);
		}
		
		return c.json(graph);
	} catch (error: any) {
		console.error('Error fetching graph:', error);
		return c.json({ error: error.message }, 500);
	}
};

export const addGraph = async (c: any) => {
	try {
		const body = await c.req.json();
		
		const validatedData = graphSchema.parse(body);
		
		const graph = await graphStore.createGraph(validatedData);
		
		return c.json(graph, 201);
	} catch (error: any) {
		console.error('Error creating graph:', error);
		
		if (error instanceof z.ZodError) {
			return c.json({ message: 'Invalid input data', errors: error.issues }, 400);
		}
		
		return c.json({ error: error.message }, 500);
	}
};

export const editGraph = async (c: any) => {
	try {
		const { id } = c.req.param();
		const body = await c.req.json();
		
		const validatedData = graphSchema.parse(body);
		
		const updatedGraph = await graphStore.updateGraph(id, validatedData);
		
		if (!updatedGraph) {
			return c.json({ message: 'Graph not found' }, 404);
		}
		
		return c.json(updatedGraph);
	} catch (error: any) {
		console.error('Error updating graph:', error);
		
		if (error instanceof z.ZodError) {
			return c.json({ message: 'Invalid input data', errors: error.issues }, 400);
		}
		
		return c.json({ error: error.message }, 500);
	}
};

export const deleteGraph = async (c: any) => {
	try {
		const { id } = c.req.param();
		
		const deleted = await graphStore.deleteGraph(id);
		
		if (!deleted) {
			return c.json({ message: 'Graph not found' }, 404);
		}
		
		return c.json({ message: 'Graph deleted successfully' });
	} catch (error: any) {
		console.error('Error deleting graph:', error);
		return c.json({ error: error.message }, 500);
	}
};
