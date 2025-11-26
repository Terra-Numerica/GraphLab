# ---------- FRONTEND (Vite) ----------
FROM node:alpine AS frontend-build
WORKDIR /frontend

COPY frontend/package.json ./
RUN npm install
COPY frontend ./

RUN npm run build

# ---------- BACKEND (Hono) ----------
FROM node:alpine AS backend-build
WORKDIR /backend

COPY backend/package.json ./
RUN npm install
COPY backend ./

COPY --from=frontend-build /frontend/dist ./public

RUN npm run build

# ---------- PRODUCTION ----------
FROM node:alpine AS production

WORKDIR /app

COPY --from=backend-build /backend/dist ./dist
COPY --from=backend-build /backend/package.json ./
COPY --from=backend-build /backend/public ./public

RUN npm install --omit=dev

CMD ["npm", "run", "start"]