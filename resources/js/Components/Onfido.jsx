import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { OnfidoSdk } from '@onfido/onfido-sdk-ui';

export default function Onfido() {
    const [sdkToken, setSdkToken] = useState(null);
    const [error, setError] = useState(null);

    const startVerification = async () => {
        try {
            const response = await router.post('/kyc/initiate');
            if (response.data.sdkToken) {
                setSdkToken(response.data.sdkToken);
            }
        } catch (err) {
            setError('Failed to start verification process');
        }
    };

    const onComplete = async (data) => {
        try {
            await router.post('/kyc/complete', {
                check_id: data.checkId,
                document_ids: data.documentIds,
                selfie_ids: data.selfieIds
            });
            router.visit('/dashboard');
        } catch (err) {
            setError('Failed to complete verification');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {!sdkToken ? (
                <button
                    onClick={startVerification}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Start KYC Verification
                </button>
            ) : (
                <OnfidoSdk
                    token={sdkToken}
                    onComplete={onComplete}
                    steps={[
                        {
                            type: 'document',
                            options: {
                                documentTypes: {
                                    passport: true,
                                    driving_licence: true,
                                    national_identity_card: true
                                }
                            }
                        },
                        {
                            type: 'face',
                            options: {
                                photoCaptureFallback: true
                            }
                        }
                    ]}
                />
            )}
        </div>
    );
}
