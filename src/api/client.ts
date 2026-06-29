import axios from 'axios';

// URL API — из переменной окружения или прокси Vite
// В продакшене API доступен на techsteam.ru/api (через nginx)
// В dev-режиме — через Vite proxy на localhost:3001
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Сообщения об ошибках по HTTP-статусам
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Неверный запрос. Проверьте введённые данные.',
  401: 'Требуется авторизация, войдите снова.',
  403: 'Доступ запрещён.',
  404: 'Запрашиваемый ресурс не найден.',
  409: 'Конфликт данных — такой объект уже существует.',
  413: 'Файл слишком большой. Размер не может превышать 50 МБ.',
  422: 'Не удалось обработать данные. Проверьте формат.',
  429: 'Слишком много запросов. Попробуйте позже.',
  500: 'Ошибка на сервере, попробуйте позже.',
  502: 'Сервер временно недоступен, попробуйте позже.',
  503: 'Сервер временно недоступен, попробуйте позже.',
};

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: добавляем JWT-токен из localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token.trim() !== '') {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  } else {
    delete config.headers.Authorization;
  }

  // При отправке FormData не устанавливаем Content-Type,
  // чтобы браузер сам задал multipart/form-data с boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// Interceptor: обработка 401 — перенаправление на логин
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Человеко-понятное сообщение из ошибки API.
 * Сначала проверяет наличие сообщения от сервера
 * (поле "error" или "message"),
 * затем возвращает текст по HTTP-статусу или "Неизвестная ошибка"
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Нет ответа от сервера
    if (!error.response) {
      return 'Нет соединения с сервером. Проверьте подключение к сети.';
    }

    const status = error.response.status;
    const serverMessage = error.response.data?.error || error.response.data?.message;

    // Если сервер вернул понятное сообщение — используем его
    if (serverMessage && typeof serverMessage === 'string') {
      return serverMessage;
    }

    // Иначе берём текст по статусу
    return ERROR_MESSAGES[status] || `Неизвестная ошибка (код ${status}). Попробуйте позже.`;
  }

  // Не-Axios ошибка
  if (error instanceof Error) {
    return error.message;
  }

  return 'Произошла неизвестная ошибка.';
}

export default apiClient;
