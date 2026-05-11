'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { AppHeader } from '../../../components/layout/AppHeader';
import { objectsApi } from '../../../lib/api';

// Демо данные пока API не подключён
const DEMO_OBJECTS: Record<string, { name: string; statementsCount: number }> = {
  'demo-1': { name: 'ЖК Царская площадь', statementsCount: 63 },
  'demo-2': { name: 'Объект Б', statementsCount: 18 },
};

export default function ObjectDetailPage() {
  const { objectId } = useParams<{ objectId: string }>();
  const demo = DEMO_OBJECTS[objectId];

  const { data: object } = useQuery({
    queryKey: ['object', objectId],
    queryFn: () => objectsApi.findOne(objectId).then((r) => r.data),
    enabled: !demo,
  });

  const name = demo?.name ?? object?.name ?? objectId;
  const count = demo?.statementsCount ?? object?.statementsCount ?? 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <div className="flex-1 flex flex-col px-8 py-6">
        <h1 className="text-3xl font-light mb-2">{name}</h1>
        <p className="text-xl text-gray-500 mb-10">Данные объекта</p>

        <div className="space-y-4 mt-auto pb-16">
          <Link href={`/objects/${objectId}/statements`}>
            <div className="btn-primary text-center py-4 rounded-xl text-xl">
              Дефектные ведомости ({count})
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
