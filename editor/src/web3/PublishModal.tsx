import { GraphJSON } from 'behave-graph';
import { FC, useState, useEffect, useCallback } from 'react';
import ModelPreview from '../scene/ModelPreview';
import { useSaveSceneToIpfs } from '../hooks/useSaveSceneToIpfs';
import useTokenContractAddress from './useTokenContractAddress';
import { MintWorldReturn } from '../hooks/useMintWorld';
import { Modal } from '../flowEditor/components/Modal';
import { Link } from 'react-router-dom';
import MintWorld from './MintWorld';
import { convertURIToHTTPS } from '../hooks/ipfs/ipfsUrlUtils';

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

  const contractAddress = useTokenContractAddress();

  return (
    <>
      <Modal
        title="Mint to Chain"
        actions={[
          { label: 'Cancel', onClick: handleClose },
          { label: 'Mint', onClick: handleMint },
        ]}
        open={open}
        onClose={onClose}
        width="4/5"
      >
        <div className="grid grid-cols-2 w-full h-32">
          {modelFile && (
            <div>
              <ModelPreview file={modelFile} />
            </div>
          )}
          <textarea
            disabled
            autoFocus
            className="border border-gray-300 p-2 align-top"
            placeholder="Paste Behave Graph JSON here"
            value={graphJsonString || ''}
            onChange={(e) => e.preventDefault()}
          ></textarea>
        </div>
        <div className="p-4 text-center text-gray-800">
          <>{saving && <p>'saving to ipfs...'</p>}</>
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
            {mintWorld?.isSuccess && typeof mintWorld?.mintedTokenId === 'undefined' && (
              <p>Successfully minted world </p>
            )}
            {typeof mintWorld?.mintedTokenId !== 'undefined' && (
              <p>
                <Link to={`/worlds/${mintWorld.mintedTokenId}`} className="underline">
                  {`World minted with id: (${mintWorld.mintedTokenId})`}
                </Link>
              </p>
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
