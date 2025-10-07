// Import
import chalk from "chalk";

// Export
export default class Logger {

	static info(content: string) {
		console.log(`${chalk.magenta("{GraphLab-V2}")} ${content}`);
	};

	static success(content: string) {
		console.log(`${chalk.green("{GraphLab-V2}")} ${content}`);
	};

	static error(content: string) {
		console.log(`${chalk.red("{GraphLab-V2}")} ${content}`);
	};

	static debug(content: string) {
		console.log(`${chalk.yellow("{GraphLab-V2}")} ${content}`);
	};

	static separator() {
		console.log(chalk.black("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-="));
	};
};
