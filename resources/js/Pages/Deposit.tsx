import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const Deposit: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [amount, setAmount] = useState<string>('5000');
  const [currency, setCurrency] = useState<string>('ngn');
  const [network, setNetwork] = useState<string>('Stellar');
  const [type, setType] = useState<string>('buy');
  // wallet_address is fixed/disabled; adjust as needed
  const walletAddress = 'GDKDSKAR6HEBOOEGWQSAX6GTQDOUAMM7Y7ZINM242ES63Y42SMCUKDMH';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure the Bridge library is available (e.g., loaded via CDN)
    const Bridge = (window as any).Bridge;
    if (!Bridge) {
      console.error('Bridge library is not loaded.');
      return;
    }

    const widget = new Bridge({
      key: 'ngnc_p_tk_cf25d94968d9df41daa9a966e0927bd2d3df3dbb2dc5df589bef7df2a7e27f19',
      type: type,
      currency: currency,
      data: {
        amount: amount,
        network: network,
        wallet_address: walletAddress,
        type: type,
      },
      onSuccess: (response: any) => console.log(response),
      onLoad: () => console.log('Bridge widget loaded successfully'),
    });
    widget.setup();
    widget.open();
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col justify-between items-center md:flex-row">
          <h2 className="text-2xl font-bold leading-tight text-blue-800 dark:text-blue-200">
            Dashboard
          </h2>
        </div>
      }
    >
      <Head title="RemittEase Dashboard" />
      <div className="container p-3 md:p-16 mx-auto">
        <div className="flex flex-col gap-3 border p-5 rounded">
          <span className="font-semibold text-lg">Fund Wallet</span>
          <form onSubmit={handleSubmit} className="grid gap-3">
            <input
              id="amount"
              className="px-3 py-2 border rounded-lg outline-none"
              type="number"
              placeholder="Amount"
              min="5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select
              id="currency"
              className="px-3 py-2 border rounded-lg outline-none"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="ngn">NGN</option>
              <option value="usd">USD</option>
            </select>
            <select
              id="network"
              className="px-3 py-2 border rounded-lg outline-none"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
            >
              <option value="Stellar">Stellar</option>
            </select>
            <select
              id="type"
              className="px-3 py-2 border rounded-lg outline-none"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <input
              id="wallet_address"
              className="px-3 py-2 border rounded-lg outline-none"
              placeholder="Wallet Address"
              value={walletAddress}
              disabled
            />
            <button
              id="submit"
              type="submit"
              className="bg-blue-500 text-white font-semibold uppercase px-3 py-2 border rounded-lg outline-none flex items-center justify-center gap-2"
            >
              Fund Wallet
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Deposit;
