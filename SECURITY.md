# Security Improvements - PM Tool

## 🔒 Исправления безопасности (Security Fixes)

Этот документ описывает критические исправления безопасности, внедренные в систему.

---

## 🔴 Критические уязвимости (ИСПРАВЛЕНО)

### 1. Обход аутентификации через HTTP-заголовки ✅ ИСПРАВЛЕНО

**Было:**
```javascript
// Fallback для демонстрации (заголовок)
const userRole = req.headers['x-user-role'] || 'developer';
```

**Проблема:** Любой пользователь мог установить роль через HTTP заголовок `x-user-role` и получить права администратора без аутентификации.

**Решение:** Полностью удален fallback механизм. Теперь **всегда** требуется JWT токен.

```javascript
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Аутентификация обязательна' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Недостаточно прав доступа' });
    }
    next();
  };
};
```

---

### 2. Слабый JWT Secret ✅ ИСПРАВЛЕНО

**Было:**
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key-change-in-production';
```

**Проблема:** Захардкоженный fallback позволял злоумышленникам подделывать JWT токены.

**Решение:** JWT_SECRET теперь **обязателен** и должен быть минимум 32 символа:

```javascript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is required!');
  process.exit(1);
}
if (JWT_SECRET.length < 32) {
  console.error('❌ FATAL: JWT_SECRET must be at least 32 characters long!');
  process.exit(1);
}
```

---

### 3. Отсутствие аутентификации на критических эндпоинтах ✅ ИСПРАВЛЕНО

**Было:** 20+ эндпоинтов были доступны без аутентификации:
- `/api/projects/*`
- `/api/tasks/*`
- `/api/templates/*`
- `/api/comments/*`

**Решение:** **Все** эндпоинты теперь защищены `authenticateToken` middleware:

```javascript
app.get('/api/projects', authenticateToken, apiLimiter, async (req, res) => { ... });
app.get('/api/tasks', authenticateToken, apiLimiter, async (req, res) => { ... });
app.get('/api/templates', authenticateToken, async (req, res) => { ... });
```

---

### 4. XSS уязвимость в SearchBar ✅ ИСПРАВЛЕНО

**Было:**
```javascript
const highlightText = (text, query) => {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>'); // Инъекция HTML!
};

<h4 dangerouslySetInnerHTML={{ __html: highlightText(project.name, query) }} />
```

**Проблема:** Использование `dangerouslySetInnerHTML` позволяло инъекции XSS через поисковый запрос.

**Решение:** Создан безопасный React компонент:

```javascript
const HighlightText = ({ text, query }) => {
  if (!text) return null;
  if (!query) return <>{text}</>;

  // Экранируем специальные символы regex
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  return (
    <>
      {parts.map((part, index) => {
        if (part.toLowerCase() === query.toLowerCase()) {
          return <mark key={index}>{part}</mark>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

// Использование:
<h4><HighlightText text={project.name} query={query} /></h4>
```

---

### 5. Открытый CORS для всех доменов ✅ ИСПРАВЛЕНО

**Было:**
```javascript
app.use(cors()); // Разрешает ВСЕ домены!
```

**Проблема:** CSRF атаки, любой сайт мог делать запросы к API.

**Решение:** CORS настраивается через переменные окружения:

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

## 🟡 Высокоприоритетные улучшения (ВНЕДРЕНО)

### 6. Rate Limiting ✅ ВНЕДРЕНО

Защита от brute force атак:

```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток
  message: { message: 'Слишком много попыток входа. Попробуйте через 15 минут.' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100 // максимум 100 запросов
});

app.post('/api/auth/login', authLimiter, ...);
app.get('/api/projects', authenticateToken, apiLimiter, ...);
```

---

### 7. Валидация входных данных ✅ ВНЕДРЕНО

Используется `express-validator` на всех эндпоинтах:

```javascript
app.post('/api/auth/login',
  authLimiter,
  [
    body('email').trim().isEmail().normalizeEmail(),
    body('password').isLength({ min: 6, max: 72 })
  ],
  validate,
  async (req, res) => { ... }
);

app.post('/api/tasks',
  authenticateToken,
  [
    body('title').trim().isLength({ min: 2, max: 200 }),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('projectId').isUUID()
  ],
  validate,
  async (req, res) => { ... }
);
```

---

### 8. Security Headers (Helmet) ✅ ВНЕДРЕНО

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  }
}));
```

---

### 9. Request Body Size Limits ✅ ВНЕДРЕНО

Защита от DoS атак через большие payloads:

```javascript
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));
```

---

### 10. Централизованная обработка ошибок ✅ ВНЕДРЕНО

```javascript
app.use((err, req, res, next) => {
  const errorId = uuidv4();
  console.error(`[ERROR ${errorId}]`, err);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ errorId, message: 'CORS policy error' });
  }

  res.status(err.status || 500).json({
    errorId,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});
```

---

## 🟢 Дополнительные улучшения

### 11. Health Check Endpoints

```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/ready', async (req, res) => {
  try {
    await db.get('SELECT 1');
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready' });
  }
});
```

---

### 12. Persistent Database (SQLite)

- ✅ Миграция с in-memory storage на SQLite
- ✅ Все данные сохраняются между перезапусками
- ✅ Подготовлено для миграции на PostgreSQL/MySQL

---

### 13. Улучшенное логирование

```javascript
const logAction = (action) => {
  return (req, res, next) => {
    const userRole = req.user ? req.user.role : 'anonymous';
    const userId = req.user ? req.user.userId : 'unknown';
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${userRole}(${userId}): ${action} - ${req.method} ${req.path}`);
    next();
  };
};
```

---

### 14. Graceful Shutdown

```javascript
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  db.close();
  process.exit(0);
});
```

---

## 📋 Checklist безопасности

### Критические (ОБЯЗАТЕЛЬНО)
- [x] JWT_SECRET обязателен и длиной >= 32 символа
- [x] Удален fallback аутентификации через заголовки
- [x] Все эндпоинты защищены authenticateToken
- [x] Исправлена XSS в SearchBar
- [x] CORS настроен через environment variables
- [x] Body size limits установлены (10kb)

### Высокий приоритет (РЕАЛИЗОВАНО)
- [x] Rate limiting на auth endpoints
- [x] Rate limiting на API endpoints
- [x] Валидация входных данных
- [x] Security headers (Helmet)
- [x] Централизованная обработка ошибок
- [x] Persistent database (SQLite)

### Средний приоритет (РЕАЛИЗОВАНО)
- [x] Health check endpoints
- [x] Улучшенное логирование
- [x] Graceful shutdown
- [x] Обработка необработанных ошибок

---

## 🚀 Инструкции по развертыванию

### 1. Установка зависимостей

```bash
cd server
npm install
```

Новые пакеты безопасности:
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `express-validator` - Input validation

### 2. Настройка environment variables

```bash
# Скопируйте .env.example в .env
cp .env.example .env

# Сгенерируйте безопасный JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Вставьте результат в .env файл:
JWT_SECRET=сгенерированный_секретный_ключ_64_символа
```

### 3. Настройка CORS (для production)

```bash
# В .env файле:
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
NODE_ENV=production
```

### 4. Запуск сервера

```bash
# Development
npm run dev

# Production
npm start
```

---

## 🔍 Тестирование безопасности

### Проверка JWT_SECRET

```bash
# Должен выйти с ошибкой если JWT_SECRET не установлен
unset JWT_SECRET && node index.js
# ❌ FATAL: JWT_SECRET environment variable is required!
```

### Проверка rate limiting

```bash
# Попробуйте 6 раз войти с неверным паролем
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# 6-й запрос должен вернуть 429 Too Many Requests
```

### Проверка аутентификации

```bash
# Без токена - должна быть ошибка 401
curl http://localhost:5000/api/projects
# {"message":"Токен доступа отсутствует"}

# С невалидным токеном - ошибка 403
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer invalid-token"
# {"message":"Недействительный токен"}
```

---

## 📚 Дополнительные рекомендации

### Для production:
1. **Используйте HTTPS** - всегда в production
2. **PostgreSQL/MySQL** - вместо SQLite для production
3. **Мониторинг** - добавьте Sentry, LogRocket или аналоги
4. **Регулярные обновления** - npm audit fix
5. **Backup базы данных** - автоматический backup
6. **2FA** - двухфакторная аутентификация (TODO)
7. **API Rate Limiting** - настройте под нагрузку
8. **Логирование** - Winston или Bunyan вместо console.log

---

## 🐛 Сообщить о уязвимости

Если вы обнаружили уязвимость безопасности, пожалуйста:
1. **НЕ создавайте публичный issue**
2. Свяжитесь с maintainer напрямую
3. Предоставьте детальное описание
4. Дайте время на исправление перед публикацией

---

## 📝 Changelog безопасности

### v2.0.0 (2025-01-XX) - Security Hardening
- ✅ Исправлены все критические уязвимости
- ✅ Добавлен rate limiting
- ✅ Добавлена валидация входных данных
- ✅ Исправлен XSS в SearchBar
- ✅ Настроен CORS
- ✅ Добавлены security headers
- ✅ Обязательный JWT_SECRET
- ✅ Миграция на persistent database

### v1.0.0 - Initial Release
- ⚠️ Критические уязвимости безопасности
- ⚠️ Не рекомендуется для production

---

**Status: 🟢 Production Ready**

Все критические уязвимости исправлены. Система готова к развертыванию в production с соблюдением указанных рекомендаций.
