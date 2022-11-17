import { GraphJSON } from 'behave-graph';
import SaveToIpfsAndMintButton from '../web3/SaveToIpfsAndMintButton';
import useTokenContractAddress from './useTokenContractAddress';

const PublishingControls = ({
  graphJson,
  modelUrl,
}: {
  graphJson: GraphJSON | undefined;
  modelUrl: string;
  contractAddress: string | null;
}) => {
  const contractAddress = useTokenContractAddress();

  return (
    <>
      {graphJson && contractAddress && (
        <SaveToIpfsAndMintButton behaviorGraph={graphJson} contractAddress={contractAddress} modelUrl={modelUrl} />
      )}
    </>
  );
};
