import { GraphJSON } from 'behave-graph';
import SaveToIpfsAndMintButton from './SaveToIpfsAndMintButton';
import Web3Login from './Web3Login';

export const modelOptions = ['PressButtonToStartElevator.gltf', 'SpinningSuzanne.gltf', 'CourtYard.glb'];

const ModelSelect = ({ modelUrl, setModelUrl }: { modelUrl: string; setModelUrl: (url: string) => void }) => {
  return (
    <>
      {/* <label htmlFor="countries" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">
        
        Select Model:
      </label> */}
      <select
        id="countries"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={modelUrl}
        onChange={(e) => setModelUrl(e.target.value)}
      >
        {modelOptions.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </>
  );
};

const Nav = ({
  graphJson,
  modelUrl,
  setModelUrl,
  contractAddress,
}: {
  graphJson: GraphJSON | undefined;
  modelUrl: string;
  setModelUrl: (url: string) => void;
  contractAddress: string | null;
}) => {
  return (
    <div className="grid grid-cols-3">
      <div className="col-span-2">
        <div className="grid grid-cols-3">
          <div className="col-span-2">
            {graphJson && contractAddress && (
              <SaveToIpfsAndMintButton
                behaviorGraph={graphJson}
                contractAddress={contractAddress}
                modelUrl={modelUrl}
              />
            )}
          </div>
          <div className="col-span-1">
            <ModelSelect modelUrl={modelUrl} setModelUrl={setModelUrl} />
          </div>
        </div>
      </div>
      <div className="col-span-1">
        <Web3Login />
      </div>
    </div>
  );
};

export default Nav;
