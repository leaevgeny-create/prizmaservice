'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { AppHeader } from '../../components/layout/AppHeader';
import { objectsApi } from '../../lib/api';

export default function ObjectsPage() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'active';
  const isActive = filter === 'active';

  const { data: objects, isLoading } = useQuery({
    queryKey: ['objects', filter],
    queryFn: () => objectsApi.findMy().then((r) => r.data),
  });

  const filtered = objects?.filter((o: any) =>
    isActive ? o.status === 'ACTIVE' : o.status === 'COMPLETED',
  ) ?? [];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <div className="flex-1 px-8 py-6">
        <h1 className="text-3xl font-light mb-8">
          {isActive ? 'Действующие объекты' : 'Завершенные объекты'}
        </h1>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="btn-secondary rounded-xl py-4 animate-pulse opacity-50" />
            ))}
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((obj: any) => (
            <Link key={obj.id} href={`/objects/${obj.id}`}>
              <div className="btn-secondary text-center py-4 rounded-xl text-xl">
                {obj.name}
              </div>
            </Link>
          ))}

          {/* Моковые данные для демонстрации дизайна */}
          {!isLoading && filtered.length === 0 && (
            <>
              <Link href="/objects/demo-1">
                <div className="btn-secondary text-center py-4 rounded-xl text-xl">
                  ЖК Царская площадь
                </div>
              </Link>
              <Link href="/objects/demo-2">
                <div className="btn-secondary text-center py-4 rounded-xl text-xl">
                  Объект Б
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
