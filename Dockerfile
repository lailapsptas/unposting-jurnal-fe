# Tahap 1: Build aplikasi React (hanya untuk production)
FROM node:22.11.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua file proyek
COPY . .

# Build aplikasi React (hanya untuk production)
RUN npm run build

# Tahap 2: Development
FROM node:22.11.0-alpine AS development

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua file proyek
COPY . .

# Expose port 3000 (port default React dev server)
EXPOSE 3000

# Jalankan development server
CMD ["npm", "run", "dev"]

# Tahap 3: Production
FROM nginx:alpine AS production

# Copy konfigurasi Nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy hasil build dari tahap builder (hanya jika target production)
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Jalankan Nginx
CMD ["nginx", "-g", "daemon off;"]