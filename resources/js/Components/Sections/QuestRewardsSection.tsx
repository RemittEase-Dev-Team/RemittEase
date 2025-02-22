import React, { useState } from 'react';
import { Award, CheckCircle2, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface Quest {
  id: number;
  title: string;
  description: string;
  rewardPoints: number;
  icon?: React.ReactNode;
  progress: number; // 0 to 100
}

const dummyQuests: Quest[] = [
  {
    id: 1,
    title: 'Join Our Discord',
    description: 'Introduce yourself in the #introductions channel.',
    rewardPoints: 50,
    icon: <Star className="w-10 h-10 text-neon-cyan" />,
    progress: 100,
  },
  {
    id: 2,
    title: 'Twitter Engagement',
    description: 'Like and Retweet our pinned post.',
    rewardPoints: 40,
    icon: <Award className="w-10 h-10 text-neon-cyan" />,
    progress: 80,
  },
  {
    id: 3,
    title: 'Invite a Friend',
    description: 'Invite a friend to RemittEase and have them join Discord or Twitter.',
    rewardPoints: 70,
    icon: <Star className="w-10 h-10 text-neon-cyan" />,
    progress: 60,
  },
  {
    id: 4,
    title: 'Complete KYC',
    description: 'Verify your identity to start sending higher transaction amounts.',
    rewardPoints: 100,
    icon: <CheckCircle2 className="w-10 h-10 text-neon-cyan" />,
    progress: 20,
  },
  {
    id: 5,
    title: 'Participate in AMA',
    description: 'Attend our next AMA and ask a question.',
    rewardPoints: 40,
    icon: <Award className="w-10 h-10 text-neon-cyan" />,
    progress: 0,
  },
  {
    id: 6,
    title: 'Bug Bounty',
    description: 'Find and report a valid bug or vulnerability.',
    rewardPoints: 150,
    icon: <Star className="w-10 h-10 text-neon-cyan" />,
    progress: 100,
  },
];

const QuestRewardsSection: React.FC = () => {
  // Track which quests are claimed
  const [claimedQuests, setClaimedQuests] = useState<number[]>([]);

  const handleClaim = (id: number) => {
    // If quest is complete, allow user to claim
    if (!claimedQuests.includes(id)) {
      setClaimedQuests([...claimedQuests, id]);
    }
  };

  return (
    <section
      className="relative py-16 text-soft-white overflow-hidden"
      style={{
        background: 'radial-gradient(circle, rgba(0,115,255,0.2), rgba(0,0,22,1))',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-neon-cyan">Earn Rewards</h2>
        <p className="mt-4 text-lg text-cool-gray max-w-2xl mx-auto">
          Complete quests, engage with our community, and earn Remi Points for exclusive perks.
        </p>

        {/* Quest Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {dummyQuests.map((quest) => {
            const isClaimed = claimedQuests.includes(quest.id);
            const isComplete = quest.progress >= 100;

            return (
              <motion.div
                key={quest.id}
                whileHover={{ scale: 1.03 }}
                className="bg-black bg-opacity-30 rounded-lg shadow-lg p-6 flex flex-col items-center transition-transform"
              >
                {quest.icon && <div className="mb-4">{quest.icon}</div>}

                <h3 className="text-xl font-bold text-neon-cyan mb-1">{quest.title}</h3>
                <p className="text-cool-gray text-sm mb-4">{quest.description}</p>

                {/* Progress Bar */}
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className="bg-neon-cyan h-2 transition-all"
                    style={{ width: `${quest.progress}%` }}
                  ></div>
                </div>

                <p className="text-cool-gray text-sm mb-2">Reward: {quest.rewardPoints} Remi Points</p>

                {/* Claim Button */}
                <button
                  disabled={!isComplete}
                  onClick={() => handleClaim(quest.id)}
                  className={`py-2 px-6 rounded-full text-sm font-semibold ${
                    isClaimed
                      ? 'bg-gray-600 text-white cursor-not-allowed'
                      : isComplete
                      ? 'bg-neon-cyan hover:bg-cyan-400 text-dark-navy'
                      : 'bg-gray-500 cursor-not-allowed'
                  } transition-colors`}
                >
                  {isClaimed
                    ? 'Claimed!'
                    : isComplete
                    ? 'Claim Reward'
                    : 'Incomplete'}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuestRewardsSection;
