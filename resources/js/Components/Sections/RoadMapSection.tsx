import React from 'react';
// Lucide Icons
import { Rocket, Milestone, Users, Globe, Star, DollarSign, Shield, Gift, Zap, Trophy, Calendar, Award } from 'lucide-react';

interface RoadmapItem {
  quarter: string;
  points: string[];
}

const roadmapData: RoadmapItem[] = [
  {
    quarter: 'Q2 2024 – Our Beginning',
    points: [
      'R&D: Conducted research across several blockchains.',
      'Company Inauguration: Official incorporation of RemittEase.',
    ],
  },
  {
    quarter: 'Q1 – Foundation & Community',
    points: [
      '🏆 Win Stellar Kickstart Grant – Secure early funding.',
      '🌍 Build Community (Discord & Twitter) – OG roles, exclusive rewards, and governance perks.',
      '✅ YellowCard compliance',
      '🛠 YellowCard sandbox testing environment',
      '🚀 MoonPay testing environment',
      '🧐 Finish MVP – A seamless, low-cost blockchain remittance platform.',
      '🔥 Beta Access – Early testers shape the future.',
      '🖼 Remi NFT Launch – Utility-packed NFTs for early adopters.',
      '💰 Early User Rewards – Bonuses for first movers.',
      '🔒 Private Alpha – Lower fees for high-volume users.',
      '📢 Yapper Rewards – Twitter engagement earns XP, whitelist spots, and free transactions.',
    ],
  },
  {
    quarter: 'Q2 – Growth & Testing',
    points: [
      '💳 Integrate Yellow Card – Smooth fiat on/off-ramping.',
      '🏆 Win SCF Build Fund – Secure more funding.',
      '🤝 Partnerships – Major Web3 collaborations.',
      '🌐 Public Testnet – Open stress-testing.',
      '👥 Onboard 10K Testnet Users – Rewarded participation.',
      '🖼 NFT Sale – OGs whitelisted, power users get free NFTs.',
      '⚡ Quest System – XP leaderboards, hidden rewards.',
      '🎟 VIP Access – Exclusive Discord channels.',
      '💬 Twitter Spaces & AMAs – Insights, alpha leaks, industry guests.',
      '📢 Yapper Rewards – Continued incentives for engagement.',
    ],
  },
  {
    quarter: 'Q3 – Mainnet & Expansion',
    points: [
      '🚀 Mainnet V1 (Closed) – Exclusive access for dedicated community members.',
      '🤝 More Partnerships – Expanding integrations & liquidity.',
      '⚡ Elite Testers Club – Influence product decisions, enjoy perks.',
      '📢 Yapper Grand Tournament – Battle for legendary status & prizes.',
      '🔍 Remi Bug Hunt – Cash rewards & NFTs for top security finds.',
      '🌐 Making .ease Stellar domain name service for ease of transfer.',
    ],
  },
  {
    quarter: 'Q4 – Full Launch & Domination',
    points: [
      '🌍 FULL MAINNET + TGE – OGs and power users reap the rewards.',
      '💎 The Great Unveiling – A mystery utility drop for early contributors.',
      '📈 Liquidity Expansion – CEX listings, cross-chain bridges, and incentives.',
      '⚡ The Final Quest – Limited-time challenge with next-level rewards.',
      '🛠 DevX Evolution – Open APIs, grants, and more builder tools.',
      '🏠 Community Council – Governance shifts to the community.',
      '🎤 RemittEase IRL – Exclusive meetups and speaker sessions.',
      '🚀 Mega Marketing Blitz – Twitter, YouTube, and influencer campaigns.',
      'The early believers will win big. Are you in? 🔥',
    ],
  },
];

const RoadMapSection: React.FC = () => {
  return (
    <section
      className="relative py-16 bg-dark-navy text-soft-white overflow-hidden"
      style={{
        background: 'radial-gradient(circle, rgba(0, 115, 255, 0.2), rgba(0, 0, 22, 1))',
      }}
    >
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-neon-cyan text-center mb-6">
          RemittEase Roadmap
        </h2>
        <p className="text-lg text-cool-gray text-center mb-12">
          Charting our path from humble beginnings to global domination.
        </p>

        {/* Vertical Timeline Container */}
        <div className="relative pl-4 md:pl-8">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-8 top-0 w-1 bg-neon-cyan h-full rounded-full opacity-40"></div>

          {roadmapData.map((item, index) => (
            <div key={index} className="relative mb-14">
              {/* Circle marker + Quarter Title */}
              <div className="flex items-center mb-4">
                <div className="z-10 flex items-center justify-center w-8 h-8 bg-neon-cyan text-dark-navy rounded-full">
                  {/* Could replace with any Lucide icon, e.g. <Star className="w-4 h-4" /> */}
                  <Milestone className="w-4 h-4" />
                </div>
                <h3 className="text-2xl font-bold text-neon-cyan ml-4">
                  {item.quarter}
                </h3>
              </div>

              {/* Card for bullet points */}
              <div className="ml-8 md:ml-12 bg-black bg-opacity-30 rounded-lg p-4 shadow-lg">
                <ul className="list-none space-y-2 text-cool-gray">
                  {item.points.map((point, idx) => (
                    <li key={idx} className="flex items-start">
                      {/* Optional icon in front of each bullet */}
                      <Star className="text-neon-cyan w-4 h-4 mt-1 flex-shrink-0 mr-2" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoadMapSection;
