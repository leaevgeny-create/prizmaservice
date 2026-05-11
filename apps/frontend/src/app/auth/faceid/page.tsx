'use client';

import { useRouter } from 'next/navigation';

export default function FaceIDPage() {
  const router = useRouter();

  const enableFaceID = async () => {
    try {
      // WebAuthn / биометрика устройства
      if (window.PublicKeyCredential) {
        // В реальном приложении здесь регистрируется WebAuthn credential
        console.log('WebAuthn enroll...');
      }
    } catch {
      // Пользователь отказал — продолжаем без FaceID
    }
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 text-center">
      {/* Иконка FaceID */}
      <div className="w-32 h-32 bg-[#d9d9d9] rounded-2xl mb-8 flex items-center justify-center">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="8" width="12" height="3" rx="1.5" stroke="#666" strokeWidth="1.5"/>
          <rect x="8" y="8" width="3" height="12" rx="1.5" stroke="#666" strokeWidth="1.5"/>
          <rect x="44" y="8" width="12" height="3" rx="1.5" stroke="#666" strokeWidth="1.5"/>
          <rect x="53" y="8" width="3" height="12" rx="1.5" stroke="#666" strokeWidth="1.5"/>
          <rect x="8" y="53" width="12" height="3" rx="1.5" stroke="#666" strokeWidth="1.5"/>
          <rect x="8" y="44" width="3" height="12" rx="1.5" stroke="#666" strokeWidth="1.5"/>
          <rect x="44" y="53" width="12" height="3" rx="1.5" stroke="#666" strokeWidth="1.5"/>
          <rect x="53" y="44" width="3" height="12" rx="1.5" stroke="#666" strokeWidth="1.5"/>
          {/* Лицо */}
          <circle cx="24" cy="28" r="2" fill="#666"/>
          <circle cx="40" cy="28" r="2" fill="#666"/>
          <path d="M22 40 Q32 46 42 40" stroke="#666" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M28 22 L28 34" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      <h1 className="text-4xl font-light mb-4">FaceID</h1>
      <p className="text-lg text-gray-600 leading-snug mb-12">
        Что бы не вводить пароль,<br />подключите FaceID
      </p>

      <div className="w-full space-y-3">
        <button onClick={enableFaceID} className="btn-primary">
          Подключить FaceID
        </button>
        <button onClick={() => router.push('/home')} className="btn-secondary">
          Пропустить
        </button>
      </div>
    </div>
  );
}
