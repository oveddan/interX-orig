import { useEffect } from 'react';
import { GraphJSON } from 'behave-graph';
import useMintWorld, { MintWorldReturn } from '../hooks/useMintWorld';

// this allows us to conditionally call useMintWorld with all required arguments passed
const MintWorld = ({
  cid,
  behaviorGraph,
  contractAddress,
  setMintWorld,
}: {
  cid: string;
  behaviorGraph: GraphJSON;
  contractAddress: string;
  setMintWorld: (mintWorld: MintWorldReturn | null) => void;
}) => {
  const { error, isError, isLoading, isSuccess, mint, mintedTokenId } = useMintWorld({
    worldCid: cid,
    behaviorGraph,
    contractAddress,
  });

  useEffect(() => {
    setMintWorld({
      error,
      isError,
      isLoading,
      isSuccess,
      mint,
      mintedTokenId,
    });
  }, [error, isError, isLoading, isSuccess, mint, mintedTokenId, setMintWorld]);

  useEffect(() => {
    return () => {
      setMintWorld(null);
    };
  }, []);

  return null;
};

export default MintWorld;
