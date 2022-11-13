import { GraphJSON } from 'behave-graph';
import useInteractiveWorldMinter from '../hooks/useInteractiveWorldMinter';
import clsx from 'clsx';
import { abi } from '../contracts/abi';
import { useContractEvent } from 'wagmi';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const MintToChainButton = ({
  cid,
  behaviorGraph,
  contractAddress,
}: {
  cid: string;
  behaviorGraph: GraphJSON;
  contractAddress: string;
}) => {
  const { isSuccess, isLoading, isError, error, write } = useInteractiveWorldMinter({
    behaviorGraph,
    contractAddress,
    worldCid: cid,
  });

  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);

  useContractEvent({
    address: contractAddress,
    abi: abi,
    eventName: 'SafeMint',
    listener(tokenId, to, uri, nodes) {
      // hack - if this was minted with the proper cid, we can assume this was the token.
      if (uri === cid) {
        setMintedTokenId(tokenId.toNumber());
      }
    },
  });

  const disabled = isSuccess || isLoading;

  return (
    <>
      <button
        type="submit"
        className={clsx(
          'text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-2 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800',
          { 'bg-blue-700 hover:bg-blue-800': !disabled, 'bg-gray-600': disabled }
        )}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          if (write) write();
        }}
      >
        Mint On Chain World
      </button>
      {mintedTokenId && (
        <div>
          <Link to={`/worlds/${mintedTokenId}`} className="underline absolute top-20 left-0 z-40">
            {`Token minted with id: (${mintedTokenId})`}{' '}
          </Link>
        </div>
      )}
    </>
  );
};

export default MintToChainButton;
