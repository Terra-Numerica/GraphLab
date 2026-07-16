declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    DATA_DIR?: string;
    NODE_ENV: 'development' | 'production' | 'test';
    JWT_SECRET?: string;
    ADMIN_USERNAME: string;
    ADMIN_PASSWORD: string;
    DISCORD_URL?: string;
    BACKEND_URL?: string;
    FRONTEND_URL?: string;
  }
}
