FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# Copy application code
COPY backend/src ./src
COPY backend/server.js ./

# Environment
ENV NODE_ENV=production
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
