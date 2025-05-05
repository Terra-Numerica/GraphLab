// Import
import chalk from "chalk";

// Export
export default class Logger {

	static info(content: string) {
		console.log(`${chalk.magenta("{Graph-App}")} ${content}`);
	};

	static success(content: string) {
		console.log(`${chalk.green("{Graph-App}")} ${content}`);
	};

	static error(content: string) {
		console.log(`${chalk.red("{Graph-App}")} ${content}`);
	};

	static debug(content: string) {
		console.log(`${chalk.yellow("{Graph-App}")} ${content}`);
	};

	static separator() {
		console.log(chalk.black("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-="));
	};
};