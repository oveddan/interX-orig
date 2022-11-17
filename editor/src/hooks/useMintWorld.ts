import { GraphJSON, NodeParametersJSON, NodeParameterValueJSON } from 'behave-graph';
import { useEffect, useState } from 'react';
import { usePrepareContractWrite, useContractWrite, useContractEvent } from 'wagmi';
import { abi } from '../contracts/abi';
import {
  actionNameParamName,
  smartContractInvokedActionName,
  togenGatedAddressParamName,
  tokenGatedParamName,
} from '../nodes/smartContracts/TokenGatedActionInvoker';

type TokenizedAction = {
  nodeType: number;
  id: string;
  tokenGateRule: {
    active: boolean;
    tokenContract: `0x${string}`;
  };
};

export const tokenizableActionTypes: string[] = [smartContractInvokedActionName];

const getParam = (x: NodeParametersJSON | undefined, paramName: string) => {
  if (!x) return undefined;

  const paramAndValue = x[paramName] as NodeParameterValueJSON | undefined;

  return paramAndValue?.value;
};

const actionsToSmartContractActions = (behaviorGraph: GraphJSON, contractAddress: string): TokenizedAction[] => {
  const validNodes = behaviorGraph.nodes?.filter((x) => tokenizableActionTypes.includes(x.type));

  if (!validNodes) return [];

  const result = validNodes.map((x): TokenizedAction => {
    const parameters = x.parameters;
    const actionName = getParam(parameters, actionNameParamName) as string | undefined;
    const active = !!getParam(parameters, tokenGatedParamName);
    const address = getParam(parameters, togenGatedAddressParamName) as `0x${string}` | undefined;

    if (!actionName) throw new Error(`actionName: ${actionName}  must not be null`);

    const inner: TokenizedAction = {
      id: actionName,
      nodeType: 0,
      tokenGateRule: {
        active,
        tokenContract: address || (contractAddress as `0x${string}`),
      },
    };

    return inner;
  }) || [contractAddress];

  return result;
};

const toMintArgs = (cid: string, behaviorGraph: GraphJSON, contractAddress: string): [string, TokenizedAction[]] => [
  cid,
  actionsToSmartContractActions(behaviorGraph, contractAddress),
];

const useWaitForMintedTokenWithContentUri = ({ contractAddress, cid }: { contractAddress: string; cid: string }) => {
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

  return mintedTokenId;
};

const useMintWorld = ({
  worldCid,
  contractAddress,
  behaviorGraph,
}: {
  contractAddress: string;
  worldCid: string;
  behaviorGraph: GraphJSON;
}) => {
  const [args, setArgs] = useState(() => toMintArgs(worldCid, behaviorGraph, contractAddress));

  useEffect(() => {
    const args = toMintArgs(worldCid, behaviorGraph, contractAddress);
    setArgs(args);
  }, [worldCid, behaviorGraph, contractAddress]);

  const { config, error, isError } = usePrepareContractWrite({
    address: contractAddress,
    abi,
    functionName: 'safeMint',
    args,
  });

  const { data, isLoading, isSuccess, write } = useContractWrite({
    ...config,
  });

  const mintedTokenId = useWaitForMintedTokenWithContentUri({
    contractAddress,
    cid: worldCid,
  });

  // useWhyDidYouUpdate('mintWorld', {
  //   data,
  //   mintedTokenId,
  //   isLoading,
  //   isSuccess,
  //   write,
  //   ...config,
  //   error,
  //   isError,
  //   args,
  // });

  return { mint: write, isSuccess, isLoading, isError, error, mintedTokenId };
};

export type MintWorldReturn = ReturnType<typeof useMintWorld>;

export default useMintWorld;
