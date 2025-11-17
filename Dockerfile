# Backend и Frontend в одном образе
FROM node:18-alpine as builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json для установки зависимостей
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps
RUN cd server && npm install --legacy-peer-deps
RUN cd client && npm install --legacy-peer-deps

# Копируем остальные файлы
COPY . .

# Собираем frontend
RUN cd client && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Копируем только необходимое из builder
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/build ./client/build

# Устанавливаем рабочую директорию на server
WORKDIR /app/server

# Открываем порт
EXPOSE 5000

# Запускаем сервер
CMD ["node", "index.js"]
