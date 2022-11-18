import { GraphJSON } from 'behave-graph';
import { FC, useState, useEffect, useCallback } from 'react';
import InteractiveModelPreview from '../scene/InteractiveModelPreview';
import { useSaveSceneToIpfs } from '../hooks/useSaveSceneToIpfs';
import useTokenContractAddress from './useTokenContractAddress';
import { MintWorldReturn } from '../hooks/useMintWorld';
import { Modal } from '../flowEditor/components/Modal';
import { Link } from 'react-router-dom';
import MintWorld from './MintWorld';
import { convertURIToHTTPS } from '../hooks/ipfs/ipfsUrlUtils';
import { useNetwork } from 'wagmi';

export type LoadModalProps = {
  open?: boolean;
  onClose: () => void;
  graphJson: GraphJSON | undefined;
  modelFile: File | undefined;
};

export const PublishModal: FC<LoadModalProps> = ({ open = false, onClose, graphJson, modelFile }) => {
  const { cid, saveSceneToIpfs, saving } = useSaveSceneToIpfs({ modelFile, behaviorGraph: graphJson });

  const [graphJsonString, setGraphJsonString] = useState<string | null>(null);

  useEffect(() => {
    if (!graphJson) return;
    setGraphJsonString(JSON.stringify(graphJson, null, 2));
  }, [graphJson]);

  const [startMinting, setStartMinting] = useState(false);

  const handleMint = useCallback(() => {
    setStartMinting(true);
  }, []);

  useEffect(() => {
    if (!startMinting) return;
    // if should start minting, and missing cid,
    if (!cid) saveSceneToIpfs();
  }, [cid, startMinting, saveSceneToIpfs]);

  const [mintWorld, setMintWorld] = useState<MintWorldReturn | null>(null);

  const [mintingToChain, setMintingToChain] = useState(false);

  // useWhyDidYouUpdate('mint', {
  //   mint: mintWorld?.mint,
  //   cid,
  //   startMinting,
  //   graphJson,
  // });

  useEffect(() => {
    if (!startMinting || mintingToChain || mintWorld?.isError) return;

    if (cid && mintWorld?.mint) {
      console.log('minting');
      setMintingToChain(true);
      mintWorld.mint();
    }
  }, [mintWorld?.mint, cid, startMinting, mintingToChain, mintWorld?.isError]);

  const handleClose = () => {
    onClose();
  };

  const network = useNetwork();

  const contractAddress = useTokenContractAddress();

  return (
    <>
      <Modal
        title={<>Mint interactive scene to {network.chain?.name}</>}
        actions={[
          { label: 'Cancel', onClick: handleClose, disabled: saving || !!mintWorld?.isLoading },
          { label: 'Mint', onClick: handleMint, disabled: saving || !!mintWorld?.isLoading || mintWorld?.isSuccess },
        ]}
        open={open}
        onClose={onClose}
        width="4/5"
      >
        <div className="grid">
          {modelFile && graphJson && (
            <div>
              <InteractiveModelPreview file={modelFile} graphJson={graphJson} />
            </div>
          )}
          {/* <label htmlFor="behavee-graph" className="block text-sm font-medium text-gray-700">
            behave graph json
          </label> */}
          {/* <div className="mt-1">
            <textarea
              disabled
              id="behave-graph"
              name="behave-graph"
              rows={5}
              className="block w-full border-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={graphJsonString || ''}
              onChange={(e) => e.preventDefault()}
            />
          </div> */}
        </div>
        <div className="p-4 text-center text-gray-800">
          <>{saving && <p>saving to ipfs...</p>}</>
          <>
            {cid && (
              <p>
                <a href={convertURIToHTTPS(`ipfs://${cid}`)} className="underline">
                  Saved to Ipfs
                </a>
              </p>
            )}
            {mintWorld?.isError && <p>{mintWorld.error?.message}</p>}
            {mintWorld?.isLoading && <p>minting the world...</p>}
            {mintWorld?.isSuccess && (
              <>
                <p>Successfully minted world </p>
                {typeof mintWorld?.mintedTokenId === 'number' && (
                  <p>
                    <Link to={`/worlds/${mintWorld?.mintedTokenId}`} className="underline">
                      {`World minted with id: (${mintWorld?.mintedTokenId})`}
                    </Link>
                  </p>
                )}
              </>
            )}
          </>
        </div>
      </Modal>
      {cid && graphJson && contractAddress && (
        <MintWorld cid={cid} behaviorGraph={graphJson} contractAddress={contractAddress} setMintWorld={setMintWorld} />
      )}
    </>
  );
};
