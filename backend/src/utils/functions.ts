import Logger from "@/base/Logger";

export const sleep = (ms: number) => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

export const sendDiscordMessage = async (message: string) => {
    try {
        const response = await fetch(process.env.DISCORD_URL!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: message
            })
        });

        if (!response.ok) {
            throw new Error(`Discord webhook failed with status ${response.status}`);
        }
    } catch (error: any) {
        Logger.error(`Failed to send Discord message: ${error.message}`);
    }
};

export const keepAliveRenderdotCom = async () => {
    const backendURL = process.env.BACKEND_URL;
    const frontendURL = process.env.FRONTEND_URL;

    Promise.all([
        await request(backendURL),
        await request(frontendURL),
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