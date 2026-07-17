# Pake node versi stabil
FROM node:20-alpine

# Set folder kerja
WORKDIR /app

# Copy package.json dan install dependency
COPY package*.json ./
RUN npm install

# Copy semua file backend
COPY . .

# Port default socket.io (biasanya 4000 atau 3000)
EXPOSE 7860

# Jalankan server
CMD ["node", "server.js"]