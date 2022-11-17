import { useState } from 'react';
import { GraphJSON } from 'behave-graph';
import { ControlButton } from 'reactflow';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { PublishModal } from './PublishModal';

const ChainIcon = () => (
  <ConnectButton.Custom>
    {({ chain }) => {
      if (!chain?.iconUrl) return null;
      // Note: If your app doesn't use authentication, you
      // can remove all 'authenticationStatus' checks
      return <img alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} style={{ width: 12, height: 12 }} />;
    }}
  </ConnectButton.Custom>
);

const PublishingControls = ({
  graphJson,
  modelFile,
}: {
  graphJson: GraphJSON | undefined;
  modelFile: File | undefined;
}) => {
  const [publishingModalOpen, setPublishModalOpen] = useState(false);

  return (
    <>
      <ControlButton title="Publish" onClick={() => setPublishModalOpen(true)}>
        <ChainIcon />
      </ControlButton>

      <PublishModal
        open={publishingModalOpen}
        onClose={() => setPublishModalOpen(false)}
        graphJson={graphJson}
        modelFile={modelFile}
      />
    </>
  );
};

export default PublishingControls;
