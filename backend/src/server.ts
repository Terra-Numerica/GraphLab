// Imports
import { keepAliveRenderdotCom } from "@/utils/functions";
import { connectDatabase } from "@/base/Database";
import { checkConfig } from "@/utils/config";

import Logger from "@/base/Logger";
import express from "express";
import cors from "cors";
import "dotenv/config";

// Routes
import graphRoute from "@/routes/graph.route";

try {

	// Check Config
	Logger.info("Checking configuration...");
	await checkConfig();
	Logger.success("Configuration is valid");

	// Initialize Express
	const app = express();

	// Middleware
	app.use(express.urlencoded({ extended: false }));
	app.use(express.json());
	app.use(cors({
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"]
	}));

	// Initialize Database Connection
	Logger.info("Connecting to the database...");
	await connectDatabase();
	Logger.success("Connected to the database");

	// Use Routes
	app.use("/api/graph", graphRoute);

	// Get port from environment or default to 3000
	const port = process.env.PORT || 3000;

	// Start the server
	Logger.info(`Starting server on port ${port}...`);
	app.listen(port, () => {
		Logger.success(`Server is running on port ${port}`);
	});

	if(process.env.NODE_ENV === "production") {
		setInterval(async () => {
			await keepAliveRenderdotCom();
		}, 30000);
	};

} catch (error: any) {
	console.log(error.stack);
	process.exit(1);
};