import React from 'react';
import { SendHorizontal, ArrowDownToLine, Banknote, History, Users } from 'lucide-react';

interface QuickActionsProps {
  onDeposit: () => void;
  onSendRemittance: () => void;
  onViewRecipients: () => void;
  wallet: {
    publicKey: string;
    balance: number;
    status: string;
  } | null;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onDeposit,
  onSendRemittance,
  onViewRecipients,
  wallet
}) => {
  const actions = [
    {
      title: 'Fund Account',
      description: 'Add money to your account',
      icon: <ArrowDownToLine className="w-6 h-6" />,
      onClick: onDeposit,
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-500/10',
      enabled: true,
    },
    {
      title: 'Send Money',
      description: 'Send money internationally',
      icon: <SendHorizontal className="w-6 h-6" />,
      onClick: onSendRemittance,
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-500/10',
      enabled: Boolean(wallet?.publicKey && wallet?.balance > 0),
    },
    {
      title: 'Recipients',
      description: 'Manage your recipients',
      icon: <Users className="w-6 h-6" />,
      onClick: onViewRecipients,
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-500/10',
      enabled: true,
    },
    {
      title: 'Transfer History',
      description: 'View past transfers',
      icon: <History className="w-6 h-6" />,
      onClick: () => {
        // Implement transfer history view
      },
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-500/10',
      enabled: true,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Quick Actions</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={`action-${index}`}
            onClick={action.onClick}
            disabled={!action.enabled}
            className={`
              relative group p-4 rounded-xl transition-all duration-200
              ${action.bgColor}
              ${!action.enabled && 'opacity-50 cursor-not-allowed'}
              hover:shadow-md hover:scale-105 transform
            `}
          >
            <div className={`
              ${action.iconBg} ${action.textColor}
              p-3 rounded-lg inline-block mb-3
            `}>
              {action.icon}
            </div>

            <h3 className={`
              font-medium mb-1
              ${action.textColor}
            `}>
              {action.title}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {action.description}
            </p>
          </button>
        ))}
      </div>

      {!wallet?.publicKey && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Fund your account to start sending money internationally
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
