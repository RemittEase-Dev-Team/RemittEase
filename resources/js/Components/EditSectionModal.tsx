import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface Hero {
  id?: number;
  title: string;
  subtitle: string;
  cta: string;
}

interface Feature {
  id?: number;
  title: string;
  description: string;
}

interface About {
  id?: number;
  mission: string;
  vision: string;
  core_values: string;
  sub_1_fees: string;
}

interface QuestReward {
  id?: number;
  title: string;
  description: string;
  rewardPoints: number;
  progress: number;
}

interface Team {
  id?: number;
  name: string;
  role: string;
  description: string;
}

type SectionContent = Hero[] | Feature[] | About[] | QuestReward[] | Team[];

interface FormData {
  [key: string]: any;
  name: string;
  content: SectionContent;
}

interface EditSectionModalProps {
  section: {
    name: string;
    content: SectionContent;
  };
  onClose: () => void;
}

const EditSectionModal: React.FC<EditSectionModalProps> = ({ section, onClose }) => {
  // Ensure content is always an array
  const initialData = Array.isArray(section.content) ? section.content : [section.content];
  const { data, setData, submit } = useForm<FormData>({
    name: section.name,
    content: initialData
  });

  const handleSubmit = () => {
    const routeMap: { [key: string]: string } = {
      'Heroes': '/admin/heroes/update',
      'Features': '/admin/features/update',
      'Abouts': '/admin/abouts/update',
      'Quest Rewards': '/admin/quest-rewards/update',
      'Teams': '/admin/teams/update'
    };

    submit('put', routeMap[section.name], {
      preserveScroll: true,
      onSuccess: () => onClose(),
    });
  };

  const addQuest = () => {
    const newQuests = [...(data.content as QuestReward[]), { title: '', description: '', rewardPoints: 0, progress: 0 }];
    setData('content', newQuests);
  };

  const removeQuest = (index: number) => {
    const newQuests = (data.content as QuestReward[]).filter((_, i) => i !== index);
    setData('content', newQuests);
  };

  const addCoreValue = (index: number) => {
    const newAbouts = [...(data.content as About[])];
    newAbouts[index].core_values = JSON.stringify([...JSON.parse(newAbouts[index].core_values), { title: '', description: '' }]);
    setData('content', newAbouts);
  };

  const removeCoreValue = (index: number, coreIndex: number) => {
    const newAbouts = [...(data.content as About[])];
    newAbouts[index].core_values = JSON.stringify(JSON.parse(newAbouts[index].core_values).filter((_: any, i: number) => i !== coreIndex));
    setData('content', newAbouts);
  };

  const addSub1Fee = (index: number) => {
    const newAbouts = [...(data.content as About[])];
    const sub1Fees = JSON.parse(newAbouts[index].sub_1_fees);
    sub1Fees.fees.push(0);
    newAbouts[index].sub_1_fees = JSON.stringify(sub1Fees);
    setData('content', newAbouts);
  };

  const removeSub1Fee = (index: number, feeIndex: number) => {
    const newAbouts = [...(data.content as About[])];
    const sub1Fees = JSON.parse(newAbouts[index].sub_1_fees);
    sub1Fees.fees = sub1Fees.fees.filter((_: any, i: number) => i !== feeIndex);
    newAbouts[index].sub_1_fees = JSON.stringify(sub1Fees);
    setData('content', newAbouts);
  };

  const renderFormFields = () => {
    // Ensure data is an array before mapping
    const dataArray = Array.isArray(data.content) ? data.content : [data.content];

    switch (section.name) {
      case 'Heroes':
        return (
          <>
            {(dataArray as Hero[]).map((hero: Hero, index: number) => (
              <div key={index} className="mb-4 p-4 border rounded shadow-lg bg-gray-800 text-white">
                <label className="block text-sm font-medium text-gray-300">Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Title"
                  value={hero.title || ''}
                  onChange={(e) => {
                    const newHeroes = [...(dataArray as Hero[])];
                    newHeroes[index].title = e.target.value;
                    setData('content', newHeroes as Hero[]);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Subtitle</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Subtitle"
                  value={hero.subtitle || ''}
                  onChange={(e) => {
                    const newHeroes = [...(dataArray as Hero[])];
                    newHeroes[index].subtitle = e.target.value;
                    setData('content', newHeroes as Hero[]);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">CTA</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="CTA"
                  value={hero.cta || ''}
                  onChange={(e) => {
                    const newHeroes = [...(dataArray as Hero[])];
                    newHeroes[index].cta = e.target.value;
                    setData('content', newHeroes as Hero[]);
                  }}
                />
              </div>
            ))}
          </>
        );
      case 'Features':
        return (
          <>
            {(dataArray as Feature[]).map((feature: Feature, index: number) => (
              <div key={index} className="mb-4 p-4 border rounded shadow-lg bg-gray-800 text-white">
                <label className="block text-sm font-medium text-gray-300">Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Title"
                  value={feature.title || ''}
                  onChange={(e) => {
                    const newFeatures = [...(dataArray as Feature[])];
                    newFeatures[index].title = e.target.value;
                    setData('content', newFeatures as Feature[]);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Description"
                  value={feature.description || ''}
                  onChange={(e) => {
                    const newFeatures = [...(dataArray as Feature[])];
                    newFeatures[index].description = e.target.value;
                    setData('content', newFeatures as Feature[]);
                  }}
                />
              </div>
            ))}
          </>
        );
      case 'Abouts':
        return (
          <>
            {(dataArray as About[]).map((about: About, index: number) => (
              <div key={index} className="mb-4 p-4 border rounded shadow-lg bg-gray-800 text-white">
                <label className="block text-sm font-medium text-gray-300">Mission</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Mission"
                  value={about.mission || ''}
                  onChange={(e) => {
                    const newAbouts = [...(dataArray as About[])];
                    newAbouts[index].mission = e.target.value;
                    setData('content', newAbouts as About[]);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Vision</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Vision"
                  value={about.vision || ''}
                  onChange={(e) => {
                    const newAbouts = [...(dataArray as About[])];
                    newAbouts[index].vision = e.target.value;
                    setData('content', newAbouts as About[]);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Core Values</label>
                {JSON.parse(about.core_values || '[]').map((coreValue: any, coreIndex: number) => (
                  <div key={coreIndex} className="mb-2">
                    <input
                      type="text"
                      className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                      placeholder="Core Value Title"
                      value={coreValue.title || ''}
                      onChange={(e) => {
                        const newAbouts = [...(dataArray as About[])];
                        const updatedCoreValues = JSON.parse(newAbouts[index].core_values || '[]');
                        updatedCoreValues[coreIndex].title = e.target.value;
                        newAbouts[index].core_values = JSON.stringify(updatedCoreValues);
                        setData('content', newAbouts as About[]);
                      }}
                    />
                    <textarea
                      className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                      placeholder="Core Value Description"
                      value={coreValue.description || ''}
                      onChange={(e) => {
                        const newAbouts = [...(dataArray as About[])];
                        const updatedCoreValues = JSON.parse(newAbouts[index].core_values || '[]');
                        updatedCoreValues[coreIndex].description = e.target.value;
                        newAbouts[index].core_values = JSON.stringify(updatedCoreValues);
                        setData('content', newAbouts as About[]);
                      }}
                    />
                    <button
                      onClick={() => removeCoreValue(index, coreIndex)}
                      className="px-4 py-2 bg-red-500 text-white rounded mt-2"
                    >
                      Remove Core Value
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addCoreValue(index)}
                  className="px-4 py-2 bg-green-500 text-white rounded mt-4"
                >
                  Add Core Value
                </button>
                <label className="block text-sm font-medium text-gray-300">Sub 1 Fees</label>
                <textarea
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Sub 1 Fees Description"
                  value={JSON.parse(about.sub_1_fees || '{}').description || ''}
                  onChange={(e) => {
                    const newAbouts = [...(dataArray as About[])];
                    const updatedSub1Fees = JSON.parse(newAbouts[index].sub_1_fees || '{}');
                    updatedSub1Fees.description = e.target.value;
                    newAbouts[index].sub_1_fees = JSON.stringify(updatedSub1Fees);
                    setData('content', newAbouts as About[]);
                  }}
                />
                {JSON.parse(about.sub_1_fees || '{}').fees.map((fee: number, feeIndex: number) => (
                  <div key={feeIndex} className="mb-2">
                    <input
                      type="number"
                      className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                      placeholder="Fee"
                      value={fee || 0}
                      onChange={(e) => {
                        const newAbouts = [...(dataArray as About[])];
                        const updatedSub1Fees = JSON.parse(newAbouts[index].sub_1_fees || '{}');
                        updatedSub1Fees.fees[feeIndex] = parseFloat(e.target.value);
                        newAbouts[index].sub_1_fees = JSON.stringify(updatedSub1Fees);
                        setData('content', newAbouts as About[]);
                      }}
                    />
                    <button
                      onClick={() => removeSub1Fee(index, feeIndex)}
                      className="px-4 py-2 bg-red-500 text-white rounded mt-2"
                    >
                      Remove Fee
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addSub1Fee(index)}
                  className="px-4 py-2 bg-green-500 text-white rounded mt-4"
                >
                  Add Fee
                </button>
              </div>
            ))}
          </>
        );
      case 'Quest Rewards':
        return (
          <>
            {(dataArray as QuestReward[]).map((quest: QuestReward, index: number) => (
              <div key={index} className="mb-4 p-4 border rounded shadow-lg bg-gray-800 text-white">
                <label className="block text-sm font-medium text-gray-300">Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Title"
                  value={quest.title || ''}
                  onChange={(e) => {
                    const newQuests = [...(dataArray as QuestReward[])];
                    newQuests[index].title = e.target.value;
                    setData('content', newQuests as QuestReward[]);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Description"
                  value={quest.description || ''}
                  onChange={(e) => {
                    const newQuests = [...(dataArray as QuestReward[])];
                    newQuests[index].description = e.target.value;
                    setData('content', newQuests as QuestReward[]);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Reward Points</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Reward Points"
                  value={quest.rewardPoints || 0}
                  onChange={(e) => {
                    const newQuests = [...(dataArray as QuestReward[])];
                    newQuests[index].rewardPoints = parseInt(e.target.value);
                    setData('content', newQuests as QuestReward[]);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Progress</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Progress"
                  value={quest.progress || 0}
                  onChange={(e) => {
                    const newQuests = [...(dataArray as QuestReward[])];
                    newQuests[index].progress = parseInt(e.target.value);
                    setData('content', newQuests as QuestReward[]);
                  }}
                />
                <button
                  onClick={() => removeQuest(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded mt-2"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addQuest}
              className="px-4 py-2 bg-green-500 text-white rounded mt-4"
            >
              Add Quest
            </button>
          </>
        );
      case 'Teams':
        return (
          <>
            {(dataArray as Team[]).map((team: Team, index: number) => (
              <div key={index} className="mb-4 p-4 border rounded shadow-lg bg-gray-800 text-white">
                <label className="block text-sm font-medium text-gray-300">Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Name"
                  value={team.name || ''}
                  onChange={(e) => {
                    const newTeams = [...(dataArray as Team[])];
                    newTeams[index].name = e.target.value;
                    setData('content', newTeams as Team[]);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Role</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Role"
                  value={team.role || ''}
                  onChange={(e) => {
                    const newTeams = [...(dataArray as Team[])];
                    newTeams[index].role = e.target.value;
                    setData('content', newTeams as Team[]);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Description"
                  value={team.description || ''}
                  onChange={(e) => {
                    const newTeams = [...(dataArray as Team[])];
                    newTeams[index].description = e.target.value;
                    setData('content', newTeams as Team[]);
                  }}
                />
              </div>
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded shadow-lg max-w-lg w-full max-h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-white">Edit {section.name}</h2>
        {renderFormFields()}
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded mr-2">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSectionModal;
