import React, { useEffect } from 'react';
import { Onfido } from 'onfido-sdk-ui';

const OnfidoComponent = ({ sdkToken, workflowRunId, onComplete } : { sdkToken: any, workflowRunId: any, onComplete: any }) => {
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
    });

    // Optional: return a cleanup function if your integration requires it.
    return () => {
      // For example, if Onfido has a teardown method:
      // Onfido.teardown();
    };
  }, [sdkToken, workflowRunId, onComplete]);

  return <div id="onfido-mount"></div>;
};

export default OnfidoComponent;
