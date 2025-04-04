import React from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface QuestReward {
  id: number;
  title: string;
  description: string;
  rewardPoints: number;
  progress: number;
  created_at?: string;
  updated_at?: string;
}

interface QuestPageProps {
  quest: any[];
}

interface FormData {
  content: QuestReward[];
}

const QuestPage: React.FC<QuestPageProps> = ({ quest }) => {
  const transformedQuest = quest.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    rewardPoints: q.reward_points,
    progress: q.progress,
    created_at: q.created_at,
    updated_at: q.updated_at,
  }));

  const { data, setData, submit } = useForm<FormData|any>({
    content: transformedQuest,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit('put', '/admin/quest-rewards/update', {
      preserveScroll: true,
    });
  };

  const updateField = (index: number, field: keyof QuestReward, value: string) => {
    const newContent = [...data.content];
    if (newContent[index]) {
      if (field === 'rewardPoints' || field === 'progress') {
        newContent[index][field] = Number(value);
      } else {
        newContent[index][field] = value as any;
      }
      setData('content', newContent);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Edit Quest Rewards</h1>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          {data.content.map((item: any, index: number) => (
            <div key={item.id} className="p-4 border rounded shadow-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  className="w-full p-2 rounded"
                  value={item.title}
                  onChange={(e) => updateField(index, 'title', e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  rows={3}
                  className="w-full p-2 rounded"
                  value={item.description}
                  onChange={(e) => updateField(index, 'description', e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Reward Points</label>
                <input
                  type="number"
                  className="w-full p-2 rounded"
                  value={item.rewardPoints}
                  onChange={(e) => updateField(index, 'rewardPoints', e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Progress</label>
                <input
                  type="number"
                  className="w-full p-2 rounded"
                  value={item.progress}
                  onChange={(e) => updateField(index, 'progress', e.target.value)}
                />
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default QuestPage;
