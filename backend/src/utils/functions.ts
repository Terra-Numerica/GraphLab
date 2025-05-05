import Logger from "@/base/Logger";

export const sleep = (ms: number) => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

export const keepAliveRenderdotCom = async () => {

    const URL = process.env.URL;

    Promise.all([
        await request(URL),
    ])
};

const request = async (url: string) => {
    try {
        const response = await fetch(url);
        Logger.success(`Recharged at ${new Date().toISOString()} (${url}): Status Code ${response.status}`);
    } catch (error: any) {
        Logger.error(`Error during reload at ${new Date().toISOString()}: ${error.message}`);
    }
};