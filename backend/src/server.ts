// Imports
import { connectDatabase } from "@/base/Database";
import { checkConfig } from "@/utils/config";

import Logger from "@/base/Logger";
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import "dotenv/config";

// Routes
import graphRoute from "@/routes/graph.route";
import authRoute from "@/routes/auth.route";
import workshopRoute from "@/routes/workshop.route";

try {

    // Check Config
    Logger.info("Checking configuration...");
    await checkConfig();
    Logger.success("Configuration is valid");

    // Initialize Hono
    const app = new Hono();

    // Middleware
    app.use('*', cors({
        origin: "*",
        allowMethods: ["GET", "POST", "PUT", "DELETE"],
        allowHeaders: ["Content-Type", "Authorization"]
    }));

    if (process.env.NODE_ENV === "production") {
        app.use("*", serveStatic({
            root: "./public/"
        }));

        app.use("/*", serveStatic({
            root: "./public/",
            path: "index.html"
        }));
    }

    // Initialize Database Connection
    Logger.info("Connecting to the database...");
    await connectDatabase();
    Logger.success("Connected to the database");

    // Use Routes
    app.route("/api/graph", graphRoute);
    app.route("/api/auth", authRoute);
    app.route("/api/workshop", workshopRoute);

    // home endpoint
    app.get('/', (c) => {
        return c.json({
            message: 'GraphLab Backend',
            version: '2.0.0',
            endpoints: {
                home: '/',
                health: '/health',
                graph: '/api/graph',
                auth: '/api/auth',
                workshop: '/api/workshop',
            }
        });
    });

    // Health check endpoint
    app.get('/health', (c) => {
        return c.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Get port from environment or default to 3000
    const port = parseInt(process.env.PORT || '3000');

    // Start the server
    Logger.info(`Starting Hono server on port ${port}...`);
    serve({
        fetch: app.fetch,
        port: port
    }, (info) => {
        Logger.success(`Hono server is running on port ${info.port}`);
    });

} catch (error: any) {
    Logger.error("Failed to start server:");
    console.log(error.stack);
    process.exit(1);
}