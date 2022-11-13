import { GraphJSON } from 'behave-graph';
import { useState } from 'react';
import SaveToIpfsButton from './SaveToIpfsButton';
import MintToChainButton from './MintToChainButton';

const SafeToIpfsAndMintButton = ({
  contractAddress,
  behaviorGraph,
  modelUrl,
}: {
  contractAddress: string;
  behaviorGraph: GraphJSON;
  modelUrl: string;
}) => {
  const [cid, setCid] = useState<string>();

  return (
    <div className="grid grid-cols-2 relative">
      <div>
        <SaveToIpfsButton modelUrl={modelUrl} behaviorGraph={behaviorGraph} setCid={setCid} />
      </div>
      <div>
        {cid && <MintToChainButton cid={cid} behaviorGraph={behaviorGraph} contractAddress={contractAddress} />}
      </div>
    </div>
  );
};

export default SafeToIpfsAndMintButton;
