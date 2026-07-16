const config = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
};

console.log('import.meta.env: ', import.meta.env);

export default config;