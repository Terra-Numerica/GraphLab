import GraphModel from '@/models/graph.model';
import type { Request, Response } from 'express';

export const getGraphs = async (req: Request, res: Response) => {
	try {
		const graphs = await GraphModel.find().sort({ createdAt: 1 });
		res.json(graphs);
	} catch (error: any) {
		res.status(500).json({ error: error.stack });
	}
};

export const getGraph = async (req: Request, res: Response) => {
	try {
		const graph = await GraphModel.findById(req.params.id);
		res.json(graph);
	} catch (error: any) {
		res.status(500).json({ error: error.stack });
	}
};

export const addGraph = async (req: Request, res: Response) => {
	try {
		const graph = new GraphModel(req.body);
		await graph.save();
		res.status(201).json(graph);
	} catch (error: any) {
		console.log(error);
		res.status(500).json({ error: error.stack });
	}
};

export const editGraph = async (req: Request, res: Response) => {
	try {
		const updatedGraph = await GraphModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
		res.json(updatedGraph);
	} catch (error: any) {
		res.status(500).json({ error: error.stack });
	}
};

export const deleteGraph = async (req: Request, res: Response) => {
	try {
		await GraphModel.findByIdAndDelete(req.params.id);
		res.json({ message: 'Graph deleted successfully' });
	} catch (error: any) {
		res.status(500).json({ error: error.stack });
	}
};
