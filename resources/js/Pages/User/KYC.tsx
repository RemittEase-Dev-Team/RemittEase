import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import UserLayout from '@/Layouts/AuthenticatedLayout';
import OnfidoComponent from './Onfida';

const KYC = ({ kyc_status, can_skip, wallet_balance, sdkToken, workflowRunId } : { kyc_status: any, can_skip: any, wallet_balance: any, sdkToken: any, workflowRunId: any }) => {
    const {data, post} = useForm({})
  if (kyc_status === "verified") {
    return (
      <UserLayout>
        <Head title="KYC Verification" />
        <div className="p-6 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg max-w-3xl mx-auto">
          ✅ Your KYC verification is complete
        </div>
      </UserLayout>
    );
  }

  if (kyc_status === "pending") {
    return (
      <UserLayout>
        <Head title="KYC Verification" />
        <div className="p-6 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg max-w-3xl mx-auto">
          ⏳ Your KYC submission is under review
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <Head title="KYC Verification" />
      <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center">
            Identity Verification
          </h1>
          {sdkToken && workflowRunId ? (
            <OnfidoComponent
              sdkToken={sdkToken}
              workflowRunId={workflowRunId}
              onComplete={(data: any) => {
                console.log('Onfido completed:', data);
                // You can notify your backend or update your UI here if needed.
              }}
            />
          ) : (
            <>
            <p>Loading verification tools...</p>
            <button onClick={() => post(route('kyc.start'))} >Click here</button>
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default KYC;
