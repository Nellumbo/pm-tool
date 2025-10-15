// Конфигурация для разных сред
const config = {
  // Для локальной разработки
  development: {
    API_URL: 'http://localhost:5000',
  },
  // Для продакшена (Vercel/Netlify)
  production: {
    API_URL: window.location.origin,
  }
};

// Определяем текущую среду
const environment = process.env.NODE_ENV || 'development';

// Экспортируем конфигурацию для текущей среды
export default config[environment];
