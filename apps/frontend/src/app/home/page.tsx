'use client';

import Link from 'next/link';
import { AppHeader } from '../../components/layout/AppHeader';
import { useAuthStore } from '../../store/auth.store';

export default function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <div className="flex-1 flex flex-col px-8 py-6">
        {/* Кнопка добавить */}
        <div className="mb-8">
          <Link href="/objects/new">
            <div className="w-10 h-10 rounded-full bg-[#888888] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3 L9 15M3 9 L15 9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </Link>
        </div>

        {/* Главное меню */}
        <nav className="space-y-4 mt-auto pb-16">
          <Link href="/objects?filter=completed">
            <div className="btn-secondary text-center py-4 rounded-xl text-xl">
              Завершенные объекты
            </div>
          </Link>

          <Link href="/objects?filter=active">
            <div className="btn-secondary text-center py-4 rounded-xl text-xl">
              Действующие объекты
            </div>
          </Link>

          <Link href="/reports">
            <div className="btn-secondary text-center py-4 rounded-xl text-xl">
              Отчеты
            </div>
          </Link>
        </nav>
      </div>
    </div>
  );
}
