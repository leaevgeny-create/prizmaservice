'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';

const CODE_LENGTH = 4;
const RESEND_SECONDS = 59;

export default function CodePage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const timer = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = async (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    setError('');

    if (digits.length === CODE_LENGTH) {
      await verifyCode(digits);
    }
  };

  const verifyCode = async (digits: string) => {
    const phone = sessionStorage.getItem('auth_phone') || '';
    setLoading(true);
    try {
      const res = await authApi.verifySmsCode(phone, digits);
      setTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
      // Новый пользователь — предлагаем FaceID
      if (res.data.isNewUser) {
        router.push('/auth/faceid');
      } else {
        router.push('/home');
      }
    } catch {
      setError('Неверный код');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (countdown > 0) return;
    const phone = sessionStorage.getItem('auth_phone') || '';
    await authApi.sendSmsCode(phone);
    setCountdown(RESEND_SECONDS);
    setCode('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-light mb-4">Подтверждение</h1>
        <p className="text-lg text-gray-600">Введите код из СМС</p>
      </div>

      <div className="space-y-5">
        {/* Поле кода — 4 дефиса */}
        <div className="relative">
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="field-input text-center text-3xl tracking-[1.5rem] opacity-0 absolute inset-0 w-full h-full cursor-text"
          />
          <div className="field-input flex items-center justify-center gap-6 text-3xl pointer-events-none">
            {Array.from({ length: CODE_LENGTH }).map((_, i) => (
              <span key={i} className={code[i] ? 'text-black' : 'text-gray-400'}>
                {code[i] || '—'}
              </span>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {loading && (
          <p className="text-center text-gray-500">Проверяем код...</p>
        )}

        <button
          onClick={resendCode}
          disabled={countdown > 0}
          className="w-full text-center text-base text-gray-500 disabled:opacity-60"
        >
          Отправить код повторно{' '}
          {countdown > 0 && <span className="font-medium">00:{String(countdown).padStart(2, '0')}</span>}
        </button>
      </div>
    </div>
  );
}
