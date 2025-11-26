declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    MONGODB_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
    JWT_SECRET: string;
    DISCORD_URL?: string;
    BACKEND_URL?: string;
    FRONTEND_URL?: string;
  }
}
