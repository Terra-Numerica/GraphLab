// Imports
import mongoose from "mongoose";
import fs from "fs/promises";

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

		if (process.env.NODE_ENV === "production") {

			const files = await fs.readdir("./dist");

			if (files.length === 0) {
				throw new Error("No files found in the dist folder.");
			};

			if (process.argv[1].endsWith("index.ts")) {
				throw new Error("You are running the bot in production mode, please run the bot in development mode.");
			};
		};

		if (process.env.NODE_ENV === "development" && process.argv[1].endsWith("index.js")) {
			throw new Error("You are running the bot in development mode, please run the bot in production mode.");
		};

		if (mongoose.connection.readyState === 1) {
			await mongoose.disconnect();
		};
	} catch (error: any) {
		throw new Error(error);
	};
};