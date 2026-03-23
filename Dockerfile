# Build SPA
FROM node:20-bookworm AS client-build
WORKDIR /app/client
COPY client/package.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# API + static files
FROM node:20-bookworm AS runner
WORKDIR /app
COPY server/package.json ./
RUN npm install --omit=dev
COPY server/ ./
COPY --from=client-build /app/client/dist ./public
ENV NODE_ENV=production
ENV PORT=3007
EXPOSE 3007
CMD ["node", "src/index.js"]
