# 🚀 Руководство по развертыванию

Это руководство поможет вам развернуть PM Tool в различных средах.

## 📋 Предварительные требования

- **Node.js** 16+ 
- **npm** 8+
- **Git**
- **SSL сертификат** (для production)

## 🏠 Локальное развертывание

### Быстрый старт
```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/pm-tool.git
cd pm-tool

# Установите зависимости и настройте окружение
npm run setup

# Запустите приложение
npm run dev
```

### Ручная настройка
```bash
# 1. Установите зависимости
npm run install-all

# 2. Настройте переменные окружения
cp server/env.example server/.env
cp client/env.example client/.env

# 3. Отредактируйте .env файлы
nano server/.env
nano client/.env

# 4. Запустите серверы
npm run server  # Terminal 1
npm run client  # Terminal 2
```

## 🌐 Production развертывание

### 1. Подготовка сервера

#### Ubuntu/Debian
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PM2 для управления процессами
sudo npm install -g pm2

# Установка Nginx
sudo apt install nginx -y
```

#### CentOS/RHEL
```bash
# Установка Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Установка PM2
sudo npm install -g pm2

# Установка Nginx
sudo yum install nginx -y
```

### 2. Настройка приложения

```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/pm-tool.git
cd pm-tool

# Установите зависимости
npm run install-all

# Создайте production конфигурацию
cp server/env.example server/.env
cp client/env.example client/.env
```

### 3. Настройка переменных окружения

#### server/.env
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secure-jwt-secret-key-here
```

#### client/.env
```env
REACT_APP_API_URL=https://yourdomain.com
REACT_APP_NODE_ENV=production
```

### 4. Сборка и запуск

```bash
# Соберите frontend
npm run build

# Создайте PM2 конфигурацию
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'pm-tool-backend',
    script: './server/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 'max',
    exec_mode: 'cluster'
  }]
}
EOF

# Запустите с PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/pm-tool
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend
    location / {
        root /path/to/pm-tool/client/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    # API Backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активируйте конфигурацию
sudo ln -s /etc/nginx/sites-available/pm-tool /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🐳 Docker развертывание

### 1. Создайте Dockerfile для backend

```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### 2. Создайте Dockerfile для frontend

```dockerfile
# client/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-secret-key
    volumes:
      - ./server/uploads:/app/uploads

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
```

### 4. Запуск с Docker

```bash
# Сборка и запуск
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

## ☁️ Облачные платформы

### Heroku

```bash
# Установите Heroku CLI
# Создайте Procfile
echo "web: cd server && npm start" > Procfile

# Настройте переменные окружения
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key

# Деплой
git push heroku main
```

### Vercel

```bash
# Установите Vercel CLI
npm i -g vercel

# Настройте vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    },
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}

# Деплой
vercel --prod
```

### DigitalOcean App Platform

1. Подключите GitHub репозиторий
2. Настройте переменные окружения
3. Выберите план и регион
4. Деплой автоматически

## 🔒 Безопасность

### SSL сертификаты

#### Let's Encrypt (бесплатно)
```bash
# Установите Certbot
sudo apt install certbot python3-certbot-nginx

# Получите сертификат
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Автообновление
sudo crontab -e
# Добавьте: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Cloudflare (рекомендуется)
1. Зарегистрируйтесь на Cloudflare
2. Добавьте ваш домен
3. Настройте DNS записи
4. Включите SSL/TLS

### Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# iptables (CentOS)
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

## 📊 Мониторинг

### PM2 мониторинг
```bash
# Веб-интерфейс
pm2 web

# Логи
pm2 logs

# Мониторинг ресурсов
pm2 monit
```

### Логирование
```bash
# Настройте ротацию логов
sudo nano /etc/logrotate.d/pm-tool

# Содержимое:
/var/log/pm-tool/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

## 🔄 Автоматическое обновление

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to server
      run: |
        ssh user@your-server.com 'cd /path/to/pm-tool && git pull && npm run build && pm2 reload all'
```

## 🆘 Устранение неполадок

### Общие проблемы

1. **Порт уже используется**
```bash
sudo lsof -i :5000
sudo kill -9 PID
```

2. **Проблемы с правами**
```bash
sudo chown -R $USER:$USER /path/to/pm-tool
```

3. **Проблемы с SSL**
```bash
sudo nginx -t
sudo systemctl status nginx
```

4. **Проблемы с PM2**
```bash
pm2 logs
pm2 restart all
pm2 delete all && pm2 start ecosystem.config.js
```

## 📞 Поддержка

- **Issues**: Создайте issue в GitHub
- **Email**: your-email@example.com
- **Discord**: Присоединяйтесь к нашему серверу

---

**Удачного развертывания! 🚀**
