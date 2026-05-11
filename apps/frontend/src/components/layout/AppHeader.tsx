import Link from 'next/link';

interface Props {
  backHref?: string;
}

export function AppHeader({ backHref }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-4 h-[72px]">
      {/* Логотип */}
      <Link href="/" className="flex items-center gap-2">
        {/* SVG логотип Призма Сервис */}
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="22" r="21" stroke="black" strokeWidth="1.2"/>
          <path d="M22 8 L34 15 L34 29 L22 36 L10 29 L10 15 Z" stroke="black" strokeWidth="1.2" fill="none"/>
          <path d="M22 8 L22 22 L34 15" stroke="black" strokeWidth="1" fill="none"/>
          <path d="M22 22 L10 15" stroke="black" strokeWidth="1" fill="none"/>
          <path d="M22 22 L22 36" stroke="black" strokeWidth="1" fill="none"/>
          <path d="M22 22 L34 29" stroke="black" strokeWidth="1" fill="none"/>
          <path d="M22 22 L10 29" stroke="black" strokeWidth="1" fill="none"/>
        </svg>
        <div className="leading-tight">
          <div className="text-base font-semibold tracking-widest uppercase">ПРИЗМА</div>
          <div className="text-xs tracking-widest uppercase text-gray-600">СЕРВИС</div>
        </div>
      </Link>

      {/* Аватар исполнителя — оранжевый */}
      <Link href="/profile">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="22" r="21" stroke="#E8820C" strokeWidth="1.5"/>
          {/* Каска */}
          <path d="M12 20 Q12 12 22 12 Q32 12 32 20" stroke="#E8820C" strokeWidth="1.5" fill="#E8820C" fillOpacity="0.15"/>
          <path d="M10 20 L34 20" stroke="#E8820C" strokeWidth="1.5"/>
          {/* Голова */}
          <circle cx="22" cy="17" r="4" stroke="#E8820C" strokeWidth="1.2" fill="none"/>
          {/* Тело */}
          <path d="M14 38 Q14 26 22 26 Q30 26 30 38" stroke="#E8820C" strokeWidth="1.2" fill="none"/>
          {/* Руки */}
          <path d="M14 30 L10 34" stroke="#E8820C" strokeWidth="1.2"/>
          <path d="M30 30 L34 34" stroke="#E8820C" strokeWidth="1.2"/>
        </svg>
      </Link>
    </header>
  );
}
