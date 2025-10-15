@echo off
echo 🚀 Запуск PM Tool для локального использования
echo.

echo 📦 Установка зависимостей...
cd server
npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей сервера
    pause
    exit /b 1
)

cd ../client
npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей клиента
    pause
    exit /b 1
)

echo.
echo 🔧 Создание .env файла...
cd ../server
echo NODE_ENV=development > .env
echo PORT=5000 >> .env
echo JWT_SECRET=your-super-secret-jwt-key-for-local-development-12345 >> .env

echo.
echo 🏗️ Сборка клиента...
cd ../client
npm run build
if %errorlevel% neq 0 (
    echo ❌ Ошибка сборки клиента
    pause
    exit /b 1
)

echo.
echo 🚀 Запуск сервера...
cd ../server
echo.
echo ✅ Сервер запущен!
echo 🌐 Доступ: http://localhost:5000
echo 🔐 Демо-аккаунты:
echo    Админ: admin@example.com / admin123
echo    Менеджер: manager@example.com / manager123
echo    Разработчик: developer@example.com / dev123
echo.
echo 📝 Для доступа с других компьютеров в сети:
echo    http://[ВАШ_IP]:5000
echo.
echo Нажмите Ctrl+C для остановки сервера
echo.
node index-new.js
