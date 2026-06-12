import { AxiosError } from 'axios';

export const parseBackendError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<any>;
    const data = axiosError.response?.data;

    if (data?.errors && typeof data.errors === 'object') {
      const errorMessages = Object.values(data.errors).flat();
      if (errorMessages.length > 0) {
        return errorMessages.join('\n');
      }
    }

    if (data?.message) return data.message;
    if (data?.detail) return data.detail;
    
    if (data?.title) return data.title;

    if (typeof data === 'string' && data.trim() !== '') {
      return data;
    }

    if (axiosError.response?.status === 400) return 'Невірний запит. Перевірте введені дані.';
    if (axiosError.response?.status === 401) return 'Не авторизовано. Увійдіть в систему.';
    if (axiosError.response?.status === 403) return 'У вас немає доступу до цієї дії.';
    if (axiosError.response?.status === 500) return 'Помилка на сервері. Розробники вже повідомлені.';
  }

  return 'Сталася невідома помилка підключення до сервера.';
};