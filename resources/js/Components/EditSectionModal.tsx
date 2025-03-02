import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface EditSectionModalProps {
  section: {
    name: string;
    content: any;
  };
  onClose: () => void;
}

const EditSectionModal: React.FC<EditSectionModalProps> = ({ section, onClose }) => {
  const { data, setData, submit } = useForm(section.content);

  const handleSubmit = () => {
    setData({
      name: section.name,
      content: data
    });
    submit('put', `/admin/${section.name.toLowerCase()}/${section.name}`, {
      preserveScroll: true,
      onSuccess: () => onClose(),
    });
  };

  const addQuest = () => {
    setData([...data, { title: '', description: '', rewardPoints: 0, progress: 0 }]);
  };

  const removeQuest = (index: number) => {
    const newQuests = data.filter((_: any, i: number) => i !== index);
    setData(newQuests);
  };

  const addCoreValue = (index: number) => {
    const newAbouts = [...data];
    newAbouts[index].core_values = JSON.stringify([...JSON.parse(newAbouts[index].core_values), { title: '', description: '' }]);
    setData(newAbouts);
  };

  const removeCoreValue = (index: number, coreIndex: number) => {
    const newAbouts = [...data];
    newAbouts[index].core_values = JSON.stringify(JSON.parse(newAbouts[index].core_values).filter((_: any, i: number) => i !== coreIndex));
    setData(newAbouts);
  };

  const addSub1Fee = (index: number) => {
    const newAbouts = [...data];
    const sub1Fees = JSON.parse(newAbouts[index].sub_1_fees);
    sub1Fees.fees.push(0);
    newAbouts[index].sub_1_fees = JSON.stringify(sub1Fees);
    setData(newAbouts);
  };

  const removeSub1Fee = (index: number, feeIndex: number) => {
    const newAbouts = [...data];
    const sub1Fees = JSON.parse(newAbouts[index].sub_1_fees);
    sub1Fees.fees = sub1Fees.fees.filter((_: any, i: number) => i !== feeIndex);
    newAbouts[index].sub_1_fees = JSON.stringify(sub1Fees);
    setData(newAbouts);
  };

  const renderFormFields = () => {
    switch (section.name) {
      case 'Heroes':
        return (
          <>
            {data.map((hero: any, index: number) => (
              <div key={index} className="mb-4 p-4 border rounded shadow-lg bg-gray-800 text-white">
                <label className="block text-sm font-medium text-gray-300">Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Title"
                  value={hero.title}
                  onChange={(e) => {
                    const newHeroes = [...data];
                    newHeroes[index].title = e.target.value;
                    setData(newHeroes);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Subtitle</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Subtitle"
                  value={hero.subtitle}
                  onChange={(e) => {
                    const newHeroes = [...data];
                    newHeroes[index].subtitle = e.target.value;
                    setData(newHeroes);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">CTA</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="CTA"
                  value={hero.cta}
                  onChange={(e) => {
                    const newHeroes = [...data];
                    newHeroes[index].cta = e.target.value;
                    setData(newHeroes);
                  }}
                />
              </div>
            ))}
          </>
        );
      case 'Features':
        return (
          <>
            {data.map((feature: any, index: number) => (
              <div key={index} className="mb-4 p-4 border rounded shadow-lg bg-gray-800 text-white">
                <label className="block text-sm font-medium text-gray-300">Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Title"
                  value={feature.title}
                  onChange={(e) => {
                    const newFeatures = [...data];
                    newFeatures[index].title = e.target.value;
                    setData(newFeatures);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Description"
                  value={feature.description}
                  onChange={(e) => {
                    const newFeatures = [...data];
                    newFeatures[index].description = e.target.value;
                    setData(newFeatures);
                  }}
                />
              </div>
            ))}
          </>
        );
      case 'Roadmaps':
        return (
          <>
            {data.map((roadmap: any, index: number) => (
              <div key={index} className="mb-4 p-4 border rounded shadow-lg bg-gray-800 text-white">
                <label className="block text-sm font-medium text-gray-300">Quarter</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Quarter"
                  value={roadmap.quarter}
                  onChange={(e) => {
                    const newRoadmaps = [...data];
                    newRoadmaps[index].quarter = e.target.value;
                    setData(newRoadmaps);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Details</label>
                <textarea
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Details"
                  value={roadmap.details}
                  onChange={(e) => {
                    const newRoadmaps = [...data];
                    newRoadmaps[index].details = e.target.value;
                    setData(newRoadmaps);
                  }}
                />
              </div>
            ))}
          </>
        );
      case 'Abouts':
        return (
          <>
            {data.map((about: any, index: number) => (
              <div key={index} className="mb-4 p-4 border rounded shadow-lg bg-gray-800 text-white">
                <label className="block text-sm font-medium text-gray-300">Mission</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Mission"
                  value={about.mission}
                  onChange={(e) => {
                    const newAbouts = [...data];
                    newAbouts[index].mission = e.target.value;
                    setData(newAbouts);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Vision</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Vision"
                  value={about.vision}
                  onChange={(e) => {
                    const newAbouts = [...data];
                    newAbouts[index].vision = e.target.value;
                    setData(newAbouts);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Core Values</label>
                {JSON.parse(about.core_values).map((coreValue: any, coreIndex: number) => (
                  <div key={coreIndex} className="mb-2">
                    <input
                      type="text"
                      className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                      placeholder="Core Value Title"
                      value={coreValue.title}
                      onChange={(e) => {
                        const newAbouts = [...data];
                        const updatedCoreValues = JSON.parse(newAbouts[index].core_values);
                        updatedCoreValues[coreIndex].title = e.target.value;
                        newAbouts[index].core_values = JSON.stringify(updatedCoreValues);
                        setData(newAbouts);
                      }}
                    />
                    <textarea
                      className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                      placeholder="Core Value Description"
                      value={coreValue.description}
                      onChange={(e) => {
                        const newAbouts = [...data];
                        const updatedCoreValues = JSON.parse(newAbouts[index].core_values);
                        updatedCoreValues[coreIndex].description = e.target.value;
                        newAbouts[index].core_values = JSON.stringify(updatedCoreValues);
                        setData(newAbouts);
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
                  value={JSON.parse(about.sub_1_fees).description}
                  onChange={(e) => {
                    const newAbouts = [...data];
                    const updatedSub1Fees = JSON.parse(newAbouts[index].sub_1_fees);
                    updatedSub1Fees.description = e.target.value;
                    newAbouts[index].sub_1_fees = JSON.stringify(updatedSub1Fees);
                    setData(newAbouts);
                  }}
                />
                {JSON.parse(about.sub_1_fees).fees.map((fee: number, feeIndex: number) => (
                  <div key={feeIndex} className="mb-2">
                    <input
                      type="number"
                      className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                      placeholder="Fee"
                      value={fee}
                      onChange={(e) => {
                        const newAbouts = [...data];
                        const updatedSub1Fees = JSON.parse(newAbouts[index].sub_1_fees);
                        updatedSub1Fees.fees[feeIndex] = parseFloat(e.target.value);
                        newAbouts[index].sub_1_fees = JSON.stringify(updatedSub1Fees);
                        setData(newAbouts);
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
      case 'Teams':
        return (
          <>
            {data.map((team: any, index: number) => (
              <div key={index} className="mb-4 p-4 border rounded shadow-lg bg-gray-800 text-white">
                <label className="block text-sm font-medium text-gray-300">Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Name"
                  value={team.name}
                  onChange={(e) => {
                    const newTeams = [...data];
                    newTeams[index].name = e.target.value;
                    setData(newTeams);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Role</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Role"
                  value={team.role}
                  onChange={(e) => {
                    const newTeams = [...data];
                    newTeams[index].role = e.target.value;
                    setData(newTeams);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Description"
                  value={team.description}
                  onChange={(e) => {
                    const newTeams = [...data];
                    newTeams[index].description = e.target.value;
                    setData(newTeams);
                  }}
                />
              </div>
            ))}
          </>
        );
      case 'Quest Rewards':
        return (
          <>
            {data.map((quest: any, index: number) => (
              <div key={index} className="mb-4 p-4 border rounded shadow-lg bg-gray-800 text-white">
                <label className="block text-sm font-medium text-gray-300">Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Title"
                  value={quest.title}
                  onChange={(e) => {
                    const newQuests = [...data];
                    newQuests[index].title = e.target.value;
                    setData(newQuests);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Description"
                  value={quest.description}
                  onChange={(e) => {
                    const newQuests = [...data];
                    newQuests[index].description = e.target.value;
                    setData(newQuests);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Reward Points</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Reward Points"
                  value={quest.rewardPoints}
                  onChange={(e) => {
                    const newQuests = [...data];
                    newQuests[index].rewardPoints = e.target.value;
                    setData(newQuests);
                  }}
                />
                <label className="block text-sm font-medium text-gray-300">Progress</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded mb-2 bg-gray-700 text-white"
                  placeholder="Progress"
                  value={quest.progress}
                  onChange={(e) => {
                    const newQuests = [...data];
                    newQuests[index].progress = e.target.value;
                    setData(newQuests);
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
