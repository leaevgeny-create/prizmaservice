'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';
import { Role, ROLE_LABELS } from '../../../types';
import { Building2, User, Briefcase, ShieldCheck } from 'lucide-react';

const schema = z.object({
  lastName: z.string().min(2, 'Введите фамилию'),
  firstName: z.string().min(2, 'Введите имя'),
  middleName: z.string().optional(),
  email: z.string().email('Некорректный email'),
  phone: z.string().regex(/^\+7\d{10}$/, 'Формат: +79001234567'),
  password: z.string().min(8, 'Минимум 8 символов'),
  passwordConfirm: z.string(),
  role: z.enum([
    'CUSTOMER_ADMIN', 'EXECUTOR_COMPANY', 'EXECUTOR_IP', 'EXECUTOR_SELF_EMPLOYED',
  ] as const),
  agreeTerms: z.boolean().refine(Boolean, 'Необходимо принять условия'),
}).refine((d) => d.password === d.passwordConfirm, {
  message: 'Пароли не совпадают',
  path: ['passwordConfirm'],
});

type FormData = z.infer<typeof schema>;

const ROLE_OPTIONS: { role: 'CUSTOMER_ADMIN' | 'EXECUTOR_COMPANY' | 'EXECUTOR_IP' | 'EXECUTOR_SELF_EMPLOYED'; label: string; description: string; icon: React.ReactNode }[] = [
  { role: 'CUSTOMER_ADMIN', label: 'Заказчик', description: 'Генподрядчик, застройщик, подрядная организация', icon: <Building2 className="w-6 h-6" /> },
  { role: 'EXECUTOR_COMPANY', label: 'Исполнитель (Юр. лицо)', description: 'ООО, АО — компания, выполняющая работы', icon: <Briefcase className="w-6 h-6" /> },
  { role: 'EXECUTOR_IP', label: 'Исполнитель (ИП)', description: 'Индивидуальный предприниматель', icon: <User className="w-6 h-6" /> },
  { role: 'EXECUTOR_SELF_EMPLOYED', label: 'Самозанятый', description: 'Вход через Госуслуги (ЕСИА)', icon: <ShieldCheck className="w-6 h-6" /> },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const selectedRole = watch('role');

  const handleGosuslugiLogin = async () => {
    const res = await authApi.gosuslugiUrl();
    window.location.href = res.data.url;
  };

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const res = await authApi.register({
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
      });
      setTokens(res.data.accessToken, res.data.refreshToken);
      setUser({ id: res.data.userId, email: data.email, role: data.role, status: 'PENDING' });
      router.push('/verification');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Ошибка регистрации');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Логотип */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">Призма Сервис</h1>
          <p className="text-gray-500 mt-1">Цифровая платформа шлифовки и малярных работ</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Регистрация</h2>

          {/* Шаг 1: выбор роли */}
          {step === 1 && (
            <div>
              <p className="text-gray-600 mb-4">Кем вы являетесь?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => setValue('role', opt.role)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedRole === opt.role
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className={selectedRole === opt.role ? 'text-blue-600' : 'text-gray-400'}>
                        {opt.icon}
                      </span>
                      <span className="font-medium text-gray-900">{opt.label}</span>
                    </div>
                    <p className="text-sm text-gray-500">{opt.description}</p>
                  </button>
                ))}
              </div>

              {selectedRole === 'EXECUTOR_SELF_EMPLOYED' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-700 mb-3">
                    Самозанятые регистрируются через Госуслуги — ваши данные будут автоматически подтверждены.
                  </p>
                  <button
                    type="button"
                    onClick={handleGosuslugiLogin}
                    className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Войти через Госуслуги
                  </button>
                </div>
              )}

              {selectedRole && selectedRole !== 'EXECUTOR_SELF_EMPLOYED' && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700"
                >
                  Продолжить
                </button>
              )}
            </div>
          )}

          {/* Шаг 2: заполнение данных */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия *</label>
                  <input {...register('lastName')} className="input" placeholder="Иванов" />
                  {errors.lastName && <p className="error">{errors.lastName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Имя *</label>
                  <input {...register('firstName')} className="input" placeholder="Иван" />
                  {errors.firstName && <p className="error">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Отчество</label>
                  <input {...register('middleName')} className="input" placeholder="Иванович" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input {...register('email')} type="email" className="input" placeholder="ivan@company.ru" />
                  {errors.email && <p className="error">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
                  <input {...register('phone')} className="input" placeholder="+79001234567" />
                  {errors.phone && <p className="error">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Пароль *</label>
                  <input {...register('password')} type="password" className="input" />
                  {errors.password && <p className="error">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Подтвердите пароль *</label>
                  <input {...register('passwordConfirm')} type="password" className="input" />
                  {errors.passwordConfirm && <p className="error">{errors.passwordConfirm.message}</p>}
                </div>
              </div>

              <div className="flex items-start gap-2 mt-2">
                <input {...register('agreeTerms')} type="checkbox" id="terms" className="mt-1" />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  Соглашаюсь с{' '}
                  <a href="/docs/terms" className="text-blue-600 underline">условиями использования</a>{' '}
                  платформы ООО «Призма Сервис»
                </label>
              </div>
              {errors.agreeTerms && <p className="error">{errors.agreeTerms.message}</p>}

              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 rounded-lg py-3 text-gray-700 hover:bg-gray-50"
                >
                  Назад
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Уже есть аккаунт?{' '}
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Войти
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
