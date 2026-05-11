'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '../../components/layout/AppHeader';
import { useAuthStore } from '../../store/auth.store';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [faceId, setFaceId] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/auth/phone');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <div className="flex-1 px-6 py-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-[#E8820C] flex items-center justify-center mb-3">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="20" r="10" fill="white" fillOpacity="0.9"/>
              <path d="M8 52 C8 38 48 38 48 52" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold">
            {user ? `${user.phone}` : 'Профиль'}
          </h2>
          <p className="text-gray-500 text-base mt-1">Исполнитель</p>
        </div>

        {/* Info fields */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm text-gray-500 mb-1">ФИО</label>
            <div className="field-input">Бригадиренко С. В.</div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Телефон</label>
            <div className="field-input">+7 900 000 00 00</div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Компания</label>
            <div className="field-input">ООО Призма Сервис</div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">ИНН</label>
            <div className="field-input">770000000000</div>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-base">Face ID / Touch ID</span>
            <button
              type="button"
              onClick={() => setFaceId(!faceId)}
              className={`relative w-12 h-7 rounded-full transition-colors ${faceId ? 'bg-[#888888]' : 'bg-[#d9d9d9]'}`}
            >
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${faceId ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base">Уведомления</span>
            <button
              type="button"
              onClick={() => setNotifications(!notifications)}
              className={`relative w-12 h-7 rounded-full transition-colors ${notifications ? 'bg-[#888888]' : 'bg-[#d9d9d9]'}`}
            >
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button type="button" className="btn-secondary rounded-xl text-left px-4">
            Госуслуги — привязать аккаунт
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-4 rounded-xl text-center text-base font-medium text-red-500 border border-red-200"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
