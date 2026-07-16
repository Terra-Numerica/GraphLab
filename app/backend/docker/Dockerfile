# ---------- FRONTEND (Vite) ----------
FROM node:22.18.0-alpine AS frontend-build
WORKDIR /frontend

# production → app/frontend/.env.production (URL portail + /graphlab)
# development → app/frontend/.env.development (localhost)
ARG BUILD_MODE=production

COPY app/frontend/package.json ./
RUN npm install
COPY app/frontend ./
RUN npm run build -- --mode "${BUILD_MODE}"

# ---------- BACKEND (Hono) ----------
FROM node:22.18.0-alpine AS backend-build
WORKDIR /backend

COPY app/backend/package.json ./
RUN npm install
COPY app/backend ./

COPY --from=frontend-build /frontend/dist ./public

RUN npm run build

# ---------- PRODUCTION ----------
FROM node:22.18.0-alpine AS production

WORKDIR /app

ENV APP_USER=graphlab
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=backend-build /backend/dist ./dist
COPY --from=backend-build /backend/package.json ./
COPY --from=backend-build /backend/public ./public
COPY app/backend/data ./data

RUN npm install --omit=dev

RUN addgroup -S $APP_USER && adduser -S $APP_USER -G $APP_USER
RUN chown -R $APP_USER:$APP_USER /app

USER $APP_USER

EXPOSE 3000

CMD ["npm", "run", "start"]
