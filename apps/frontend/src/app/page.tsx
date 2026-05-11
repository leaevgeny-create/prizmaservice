'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home');
    } else {
      router.replace('/auth/phone');
    }
  }, [isAuthenticated, router]);

  // Splash screen
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="58" stroke="black" strokeWidth="1.5"/>
        <path d="M60 20 L92 38 L92 82 L60 100 L28 82 L28 38 Z" stroke="black" strokeWidth="1.5" fill="none"/>
        <path d="M60 20 L60 60 L92 38" stroke="black" strokeWidth="1.2" fill="none"/>
        <path d="M60 60 L28 38" stroke="black" strokeWidth="1.2" fill="none"/>
        <path d="M60 60 L60 100" stroke="black" strokeWidth="1.2" fill="none"/>
        <path d="M60 60 L92 82" stroke="black" strokeWidth="1.2" fill="none"/>
        <path d="M60 60 L28 82" stroke="black" strokeWidth="1.2" fill="none"/>
        {/* Внутренние грани */}
        <path d="M60 20 L44 38 L28 38" stroke="black" strokeWidth="0.8" fill="none" strokeOpacity="0.4"/>
        <path d="M60 20 L76 38 L92 38" stroke="black" strokeWidth="0.8" fill="none" strokeOpacity="0.4"/>
        <path d="M44 38 L44 60 L60 60" stroke="black" strokeWidth="0.8" fill="none" strokeOpacity="0.4"/>
      </svg>
      <div className="mt-6 text-center">
        <div className="text-3xl font-light tracking-[0.3em] uppercase">ПРИЗМА</div>
        <div className="text-lg tracking-[0.4em] uppercase text-gray-500 mt-1">СЕРВИС</div>
      </div>
    </div>
  );
}
