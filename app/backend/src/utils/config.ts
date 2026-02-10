// Imports
import mongoose from "mongoose";

import { z } from "zod";

const envSchema = z.object({
	PORT: z.string().min(1, "Port must be at least 1 character long"),

	MONGODB_URL: z.string().min(1, "MongoDB URL must be at least 1 character long"),

	NODE_ENV: z.string().min(1, "Node Environment must be at least 1 character long"),
});

// Export
export const checkConfig = async (): Promise<void> => {

	try {
		envSchema.parse(process.env);

		await mongoose.connect(process.env.MONGODB_URL!);

		if (mongoose.connection.readyState === 1) {
			await mongoose.disconnect();
		};
	} catch (error: any) {
		throw new Error(error);
	};
};
