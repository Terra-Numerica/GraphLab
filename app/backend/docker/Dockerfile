# ---------- FRONTEND (Vite) ----------
FROM node:alpine AS frontend-build
WORKDIR /frontend
	
COPY app/frontend/package.json ./
RUN npm install
COPY app/frontend ./
COPY app/frontend/.env.development .env.development
COPY app/frontend/.env.production .env.production

RUN npm run build

# ---------- BACKEND (Hono) ----------
FROM node:alpine AS backend-build
WORKDIR /backend
	
COPY app/backend/package.json ./
RUN npm install
COPY app/backend ./
COPY app/backend/.env .env
	
COPY --from=frontend-build /frontend/dist ./public
	
RUN npm run build

# ---------- PRODUCTION ----------
FROM node:alpine AS production
	
WORKDIR /app
	
ENV APP_USER=graphlab
	
COPY --from=backend-build /backend/dist ./dist
COPY --from=backend-build /backend/.env ./.env
COPY --from=backend-build /backend/.env.production ./.env.production
COPY --from=backend-build /backend/.env.development ./.env.development
COPY --from=backend-build /backend/package.json ./
COPY --from=backend-build /backend/public ./public
	
RUN npm install --omit=dev
	
RUN addgroup -S $APP_USER && adduser -S $APP_USER -G $APP_USER
RUN chown -R $APP_USER:$APP_USER /app
	
USER $APP_USER
	
CMD ["npm", "run", "start"]