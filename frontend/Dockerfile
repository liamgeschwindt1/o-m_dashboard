FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 8080
# Build at container startup so VITE_* env vars are available at build time,
# then serve the static output with vite preview.
CMD sh -c "npm run build && npx vite preview --host 0.0.0.0 --port ${PORT:-8080}"
