FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 8080
# Use Railway-injected $PORT, fall back to 8080 for local Docker runs.
# Running vite dev (not preview) so VITE_* env vars are read at startup —
# no build-time baking needed.
CMD sh -c "npx vite --host 0.0.0.0 --port ${PORT:-8080}"
