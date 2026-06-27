import axios from 'axios';

// Используем переменную окружения для API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Человеческие сообщения об ошибках по статусам
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Неверный запрос. Проверьте введённые данные.',
  401: 'Сессия истекла, войдите заново.',
  403: 'Доступ запрещён.',
  404: 'Запрашиваемая информация не найдена.',
  409: 'Такой объект уже существует.',
  413: 'Файл слишком большой. Максимальный размер — 50 МБ.',
  422: 'Не удалось обработать данные. Проверьте форму.',
  429: 'Слишком много запросов. Подождите немного.',
  500: 'Ошибка на сервере, попробуйте позже.',
  502: 'Сервер временно недоступен, попробуйте позже.',
  503: 'Сервер временно недоступен, попробуйте позже.',
};

// Единый экземпляр axios для всех запросов к API
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Перехватчик запросов: добавляет JWT-токен из localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token.trim() !== '') {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  } else {
    delete config.headers.Authorization;
  }

  // Если тело запроса — FormData, удаляем Content-Type,
  // чтобы браузер сам установил multipart/form-data с boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// Перехватчик ответов: при 401 перенаправляет на страницу логина
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
 * Извлекает человеческое сообщение об ошибке из ответа API.
 * Приоритет: сообщение с сервера → сообщение по статусу → "нет соединения"
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Нет соединения с сервером
    if (!error.response) {
      return 'Нет соединения с сервером. Проверьте подключение к интернету.';
    }

    const status = error.response.status;
    const serverMessage = error.response.data?.error || error.response.data?.message;

    // Если сервер вернул своё сообщение — используем его
    if (serverMessage && typeof serverMessage === 'string') {
      return serverMessage;
    }

    // Иначе — стандартное сообщение по статусу
    return ERROR_MESSAGES[status] || `Произошла ошибка (код ${status}). Попробуйте позже.`;
  }

  // Неизвестная ошибка (не от axios)
  if (error instanceof Error) {
    return error.message;
  }

  return 'Произошла неизвестная ошибка.';
}

export default apiClient;