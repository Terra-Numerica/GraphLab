// Import
import chalk from "chalk";

// Export
export default class Logger {

	static info(content: string) {
		console.log(`${chalk.magenta("{GraphLab}")} ${content}`);
	};

	static success(content: string) {
		console.log(`${chalk.green("{GraphLab}")} ${content}`);
	};

	static error(content: string) {
		console.log(`${chalk.red("{GraphLab}")} ${content}`);
	};

	static debug(content: string) {
		console.log(`${chalk.yellow("{GraphLab}")} ${content}`);
	};

	static separator() {
		console.log(chalk.black("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-="));
	};
};
