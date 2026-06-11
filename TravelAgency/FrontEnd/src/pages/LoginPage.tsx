import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthAPI } from '../api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Будь ласка, заповніть всі поля');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await AuthAPI.login({ email, password });
      // Залежно від того, як C# повертає токен. Зазвичай це response.data.token або просто response.data
      const token = typeof response.data === 'string' ? response.data : response.data.token || response.data.accessToken;
      
      await login(token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Помилка авторизації. Перевірте email та пароль.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow-md border border-gray-100">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Вхід в акаунт</h1>
      
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

        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors mt-4 disabled:bg-blue-400">
          {isLoading ? 'Зачекайте...' : 'Увійти'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        Ще немає акаунту? <Link to="/register" className="text-blue-600 font-bold hover:underline">Зареєструватися</Link>
      </p>
    </div>
  );
}