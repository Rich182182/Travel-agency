import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthAPI } from '../api/client';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    setIsLoading(true);
    try {
      await AuthAPI.register({ email, password });
      alert('Реєстрація успішна! Тепер ви можете увійти.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Помилка реєстрації.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow-md border border-gray-100">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Створення акаунту</h1>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input type="email" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Пароль</label>
          <input type="password" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Підтвердіть пароль</label>
          <input type="password" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors mt-4 disabled:bg-green-400">
          {isLoading ? 'Зачекайте...' : 'Зареєструватися'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        Вже маєте акаунт? <Link to="/login" className="text-blue-600 font-bold hover:underline">Увійти</Link>
      </p>
    </div>
  );
}