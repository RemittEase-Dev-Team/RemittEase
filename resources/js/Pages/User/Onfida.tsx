import React, { useEffect } from 'react';
import { Onfido } from 'onfido-sdk-ui';

interface OnfidoComponentProps {
  sdkToken: string;
  workflowRunId: string;
  onComplete: (data: any) => void;
}

const OnfidoComponent: React.FC<OnfidoComponentProps> = ({ sdkToken, workflowRunId, onComplete }) => {
  useEffect(() => {
    if (!sdkToken || !workflowRunId) {
      console.error('SDK token or workflowRunId is missing!');
      return;
    }

    console.log('Initializing Onfido with:', { sdkToken, workflowRunId });

    Onfido.init({
      token: sdkToken,
      containerId: 'onfido-mount',
      workflowRunId: workflowRunId,
      onComplete: (data) => {
        console.log('Onfido flow complete:', data);
        if (onComplete) onComplete(data);
      },
      onError: (error) => {
        console.error('Onfido error:', error);
      },
      steps: [
        {
          type: 'welcome',
          options: {
            title: 'Identity Verification',
            descriptions: [
              'To ensure the security of our platform and comply with regulations, we need to verify your identity.',
              'This process will take just a few minutes.'
            ]
          }
        },
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
        'face',
        'complete'
      ]
    });
  }, [sdkToken, workflowRunId, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div
        id="onfido-mount"
        className="w-full max-w-2xl min-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      />
    </div>
  );
};

export default OnfidoComponent;
