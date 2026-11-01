# syntax=docker/dockerfile:1
#
# One Dockerfile, two images. Build whichever you need with --target:
#   docker build --target api -t ems-api:local .
#   docker build --target ui  -t ems-ui:local  .

# ---------- Stage 1: build the React app (needs dev dependencies) ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY webpack.config.js ./
COPY .babelrc ./
COPY public ./public
COPY src ./src
RUN npx webpack --mode production

# ---------- Stage 2: production-only dependencies for the API ----------
FROM node:20-alpine AS api-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---------- Target: API image ----------
FROM node:20-alpine AS api
ENV NODE_ENV=production
WORKDIR /app
COPY --from=api-deps /app/node_modules ./node_modules
COPY package*.json ./
COPY server ./server
USER node
EXPOSE 4000
CMD ["node", "server/index.js"]

# ---------- Target: UI image (static files served by nginx) ----------
FROM nginx:1.27-alpine AS ui
# Folder that webpack writes to. Change if your webpack output.path is not "dist".
ARG DIST_DIR=dist
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/${DIST_DIR} /usr/share/nginx/html
EXPOSE 80
