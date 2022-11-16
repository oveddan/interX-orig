import { GraphJSON } from 'behave-graph';
import { useParams } from 'react-router-dom';
import { useSceneModificationEngine } from '../hooks/behaviorFlow';
import useLoadOnChainWorld from '../hooks/useLoadOnChainWorld';
import useLoadSceneAndRegistry from '../hooks/useLoadSceneAndRegistry';
import Web3Login from '../nav/Web3Login';
import Scene from '../scene/Scene';
import useTokenContractAddress from '../web3/useTokenContractAddressAndAbi';
import useSmartContractActions from './useSmartContractActions';
import { ISmartContractActions } from '../abstractions';

const OnChainWorld = ({
  graphJson,
  sceneFileUrl,
  smartContractActions,
  tokenId,
}: {
  graphJson: GraphJSON;
  sceneFileUrl: string;
  smartContractActions: ISmartContractActions;
  tokenId: number;
}) => {
  const { sceneJson, sceneOnClickListeners, registry, lifecyleEmitter, animations } = useLoadSceneAndRegistry({
    modelUrl: sceneFileUrl,
    smartContractActions,
  });

  useSceneModificationEngine({
    graphJson,
    eventEmitter: lifecyleEmitter,
    registry,
    run: true,
  });

  return (
    <>
      <nav className="bg-white border-gray-200 px-2 sm:px-4 py-2.5 rounded dark:bg-gray-900">
        <div className="container flex flex-wrap justify-between items-center mx-auto">
          <div className="flex items-center">
            <img src="/interx.jpg" className="h-24" alt="Interx Logo" />
          </div>
          <div className="flex md:order-2">
            <Web3Login />
          </div>
          <div className="hidden justify-between items-center w-full md:flex md:w-auto md:order-1" id="navbar-cta">
            <ul className="flex flex-col p-4 mt-4 bg-gray-50 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>Viewing On-Chain World on Token Id {tokenId}</li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="w-full h-full">
        <Scene scene={sceneJson} animationsState={animations} onClickListeners={sceneOnClickListeners} />
      </div>
    </>
  );
};

const OnChainWorldLoader = ({ tokenId, contractAddress }: { tokenId: number; contractAddress: string }) => {
  const { graphJson, sceneFileUrl } = useLoadOnChainWorld(tokenId, contractAddress);

  const smartContractActions = useSmartContractActions(contractAddress, tokenId);

  if (!sceneFileUrl || !graphJson || !smartContractActions) return null;

  return (
    <OnChainWorld
      graphJson={graphJson}
      sceneFileUrl={sceneFileUrl}
      smartContractActions={smartContractActions}
      tokenId={tokenId}
    />
  );
};
const OnChainWorldWrapper = () => {
  const { tokenId } = useParams<{ tokenId: string }>();

  const contractAddress = useTokenContractAddress();

  if (!contractAddress || !tokenId) return null;
  return <OnChainWorldLoader tokenId={+tokenId} contractAddress={contractAddress} />;
};

export default OnChainWorldWrapper;
