'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';

export default function PhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('+7');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (phone.length < 12) {
      setError('Введите номер телефона');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.sendSmsCode(phone);
      // Сохраняем номер в sessionStorage для следующего шага
      sessionStorage.setItem('auth_phone', phone);
      router.push('/auth/code');
    } catch {
      setError('Ошибка отправки кода. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (value: string) => {
    // Всегда начинается с +7
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '+7';
    const num = digits.startsWith('7') ? digits : '7' + digits;
    return '+' + num.slice(0, 11);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-light mb-4">Телефон</h1>
        <p className="text-lg text-gray-600 leading-snug">
          Введите номер телефона<br />для входа
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="field-input"
          placeholder="+7 ___ ___ __ __"
          inputMode="tel"
          autoFocus
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Отправляем...' : 'Продолжить'}
        </button>
      </div>
    </div>
  );
}
