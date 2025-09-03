// Imports
import { sleep } from "@/utils/functions";

import Logger from "@/base/Logger";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Model
import adminModel from "@/models/admin.model";

// Export
/**
 * @description Connect to the database
*/
export const connectDatabase = async (): Promise<void> => {

	let connected: boolean = false;
	let attempts: number = 0;

	while (!connected && attempts < 3) {
		try {

			await mongoose.connect(process.env.MONGODB_URL, {
				serverSelectionTimeoutMS: 10000,
				connectTimeoutMS: 10000,
				socketTimeoutMS: 20000,
			});

			await createOwner();

			connected = true;

		} catch (error: any) {
			attempts++;
			Logger.error(`Failed to connect to the database. Attempt ${attempts}/3`);
			Logger.error(error.message);
			await sleep(10000);
		};
	};

	if (!connected) {
		Logger.error("Failed to connect to the database after 3 attempts. Exiting...");
		process.exit(1);
	};
};

const createOwner = async () => {

	try {
		const username = "Megitsune";
		const password = "!Megitsune14"
	
		const megitsune = await adminModel.findOne({ username });
	
		if(!megitsune) {
			const hashedPassword = await bcrypt.hash(password, 10);
			
			const newUser = new adminModel({
				username,
				password: hashedPassword
			});
	
			await newUser.save();
	
			Logger.success("Megitsune was created")
		}else {
			Logger.info("Megitsune is already available");
		}
	
	}catch(err) {
		Logger.error(`An error has occurred : ${err}`)
	}
};