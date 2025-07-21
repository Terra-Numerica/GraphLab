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

export const frontendKeepAlive = async () => {
    const frontendURL = process.env.FRONTEND_URL;
    await request(frontendURL);
};

export const backendKeepAlive = async () => {
    const backendURL = process.env.BACKEND_URL;
    await request(backendURL);
};

export const getCurrentHour = () => {
    const IntlHour = new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    }).format(new Date());

    return IntlHour;
};

export const isWeekend = () => {
    const IntlDate = new Intl.DateTimeFormat("fr-FR", {
        weekday: "long"
    }).format(new Date());
    
    return (IntlDate === "samedi" && parseInt(getCurrentHour(), 10) >= 13 && parseInt(getCurrentHour(), 10) <= 19) || IntlDate === "dimanche";
};

const request = async (url: string) => {

    const IntlHour = getCurrentHour();

    try {
        const response = await fetch(url);
        Logger.success(`Recharged at ${IntlHour} (${url}): Status Code ${response.status}`);
    } catch (error: any) {
        Logger.error(`Error during reload at ${IntlHour} (${url}): ${error.message}`);
    }
};