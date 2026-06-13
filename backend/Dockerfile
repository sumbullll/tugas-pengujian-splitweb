# Gunakan sistem operasi Linux kecil yang sudah terinstal Node.js
FROM node:18-alpine

# Tentukan folder kerja di dalam kotak Docker
WORKDIR /app

# Copy file package.json terlebih dahulu
COPY package*.json ./

# Install semua library di dalam Docker
RUN npm install

# Copy seluruh sisa kodingan backend kamu ke dalam Docker
COPY . .

# Buka port 5000 agar bisa diakses dari browser
EXPOSE 5000

# Perintah untuk menyalakan server
CMD ["npm", "run", "dev"]