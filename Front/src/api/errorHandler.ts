import { AxiosError } from 'axios';

export const parseBackendError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<any>;
    const data = axiosError.response?.data;

    // 1. Помилки валідації ASP.NET (FluentValidation або ModelState)
    // Формат: { errors: { Name: ["Required"], Price: ["Must be > 0"] } }
    if (data?.errors && typeof data.errors === 'object') {
      const errorMessages = Object.values(data.errors).flat();
      if (errorMessages.length > 0) {
        return errorMessages.join('\n');
      }
    }

    // 2. Зловлені кастомні Exception з бекенду (з поля message або detail)
    if (data?.message) return data.message;
    if (data?.detail) return data.detail;
    
    // 3. Стандартний заголовок ProblemDetails ASP.NET (якщо немає message/detail)
    if (data?.title) return data.title;

    // 4. Якщо бекенд просто повернув текстовий рядок
    if (typeof data === 'string' && data.trim() !== '') {
      return data;
    }

    // 5. Стандартні статуси HTTP
    if (axiosError.response?.status === 400) return 'Невірний запит. Перевірте введені дані.';
    if (axiosError.response?.status === 401) return 'Не авторизовано. Увійдіть в систему.';
    if (axiosError.response?.status === 403) return 'У вас немає доступу до цієї дії.';
    if (axiosError.response?.status === 500) return 'Помилка на сервері. Розробники вже повідомлені.';
  }

  return 'Сталася невідома помилка підключення до сервера.';
};