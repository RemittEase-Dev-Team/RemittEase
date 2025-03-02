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
    submit('post', '/admin/sections/update', {
      preserveScroll: true,
      onSuccess: () => onClose(),
    });
  };

  const renderFormFields = () => {
    switch (section.name) {
      case 'Heroes':
        return (
          <>
            {data.map((hero: any, index: number) => (
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Title"
                  value={hero.title}
                  onChange={(e) => {
                    const newHeroes = [...data];
                    newHeroes[index].title = e.target.value;
                    setData(newHeroes);
                  }}
                />
                <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Subtitle"
                  value={hero.subtitle}
                  onChange={(e) => {
                    const newHeroes = [...data];
                    newHeroes[index].subtitle = e.target.value;
                    setData(newHeroes);
                  }}
                />
                <label className="block text-sm font-medium text-gray-700">CTA</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2"
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
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Title"
                  value={feature.title}
                  onChange={(e) => {
                    const newFeatures = [...data];
                    newFeatures[index].title = e.target.value;
                    setData(newFeatures);
                  }}
                />
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="w-full p-2 border rounded mb-2"
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
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Quarter</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Quarter"
                  value={roadmap.quarter}
                  onChange={(e) => {
                    const newRoadmaps = [...data];
                    newRoadmaps[index].quarter = e.target.value;
                    setData(newRoadmaps);
                  }}
                />
                <label className="block text-sm font-medium text-gray-700">Details</label>
                <textarea
                  className="w-full p-2 border rounded mb-2"
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
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Title"
                  value={about.title}
                  onChange={(e) => {
                    const newAbouts = [...data];
                    newAbouts[index].title = e.target.value;
                    setData(newAbouts);
                  }}
                />
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Description"
                  value={about.description}
                  onChange={(e) => {
                    const newAbouts = [...data];
                    newAbouts[index].description = e.target.value;
                    setData(newAbouts);
                  }}
                />
              </div>
            ))}
          </>
        );
      case 'Teams':
        return (
          <>
            {data.map((team: any, index: number) => (
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Name"
                  value={team.name}
                  onChange={(e) => {
                    const newTeams = [...data];
                    newTeams[index].name = e.target.value;
                    setData(newTeams);
                  }}
                />
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Role"
                  value={team.role}
                  onChange={(e) => {
                    const newTeams = [...data];
                    newTeams[index].role = e.target.value;
                    setData(newTeams);
                  }}
                />
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="w-full p-2 border rounded mb-2"
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
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Title"
                  value={quest.title}
                  onChange={(e) => {
                    const newQuests = [...data];
                    newQuests[index].title = e.target.value;
                    setData(newQuests);
                  }}
                />
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Description"
                  value={quest.description}
                  onChange={(e) => {
                    const newQuests = [...data];
                    newQuests[index].description = e.target.value;
                    setData(newQuests);
                  }}
                />
                <label className="block text-sm font-medium text-gray-700">Reward Points</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Reward Points"
                  value={quest.rewardPoints}
                  onChange={(e) => {
                    const newQuests = [...data];
                    newQuests[index].rewardPoints = e.target.value;
                    setData(newQuests);
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
      <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Edit {section.name}</h2>
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
