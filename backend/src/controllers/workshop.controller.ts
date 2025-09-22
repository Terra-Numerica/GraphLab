// Imports
import WorkshopModel from '@/models/workshop.model';

// Types
import type { Request, Response } from 'express';

export const getWorkshops = async (req: Request, res: Response) => {
	try {
		const workshops = await WorkshopModel.find().sort({ createdAt: 1 });
		res.json(workshops);
	} catch (error: any) {
		res.status(500).json({ error: error.stack });
	}
};

export const getWorkshop = async (req: Request, res: Response) => {
	try {
		const workshop = await WorkshopModel.findById(req.params.id);
		res.json(workshop);
	} catch (error: any) {
		res.status(500).json({ error: error.stack });
	}
};

export const addWorkshop = async (req: Request, res: Response) => {
	try {
		const workshop = new WorkshopModel(req.body);
		await workshop.save();
		res.status(201).json(workshop);
	} catch (error: any) {
		console.log(error);
		res.status(500).json({ error: error.stack });
	}
};

export const editWorkshop = async (req: Request, res: Response) => {
	try {
		const updatedWorkshop = await WorkshopModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
		res.json(updatedWorkshop);
	} catch (error: any) {
		res.status(500).json({ error: error.stack });
	}
};

export const deleteWorkshop = async (req: Request, res: Response) => {
	try {
		await WorkshopModel.findByIdAndDelete(req.params.id);
		res.json({ message: 'Workshop deleted successfully' });
	} catch (error: any) {
		res.status(500).json({ error: error.stack });
	}
};
