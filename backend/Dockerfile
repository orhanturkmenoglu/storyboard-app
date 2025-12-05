# Dockerfile
FROM node:22-alpine

WORKDIR /app

# package.json ve package-lock.json kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Uygulama dosyalarını kopyala
COPY . .

# Uygulamayı çalıştır
CMD ["node", "app.js"]
