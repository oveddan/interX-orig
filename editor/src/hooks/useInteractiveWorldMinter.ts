import { GraphJSON, NodeParameterJSON, NodeParametersJSON, NodeParameterValueJSON } from 'behave-graph';
import { useCallback, useEffect, useState } from 'react';
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { saveInteractiveWorldToIpfs } from './ipfs/ipfsInteractiveWorldSaver';
import { abi } from '../contracts/abi';
import {
  actionNameParamName,
  smartContractInvokedActionName,
  togenGatedAddressParamName,
  tokenGatedParamName,
} from '../scene/TokenGatedActionInvoker';

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

  const result: TokenizedAction[] = validNodes?.map((x): TokenizedAction => {
    const parameters = x.parameters;
    const actionName = getParam(parameters, actionNameParamName) as string | undefined;
    const active = !!getParam(parameters, tokenGatedParamName);
    const address = getParam(parameters, togenGatedAddressParamName) as `0x${string}` | undefined;

    if (!actionName) throw new Error(`actionName: ${actionName}  must not be null`);

    return {
      id: actionName,
      nodeType: 0,
      tokenGateRule: {
        active,
        tokenContract: address || (contractAddress as `0x${string}`),
      },
    };
  }) || [contractAddress];

  return result;
};

const toMintArgs = (cid: string, behaviorGraph: GraphJSON, contractAddress: string): [string, TokenizedAction[]] => [
  cid,
  actionsToSmartContractActions(behaviorGraph, contractAddress),
];

export const useSaveSceneToIpfs = ({ modelUrl, behaviorGraph }: { modelUrl: string; behaviorGraph: GraphJSON }) => {
  const [cid, setCid] = useState<string>();
  const [saving, setSaving] = useState(false);
  const saveSceneToIpfs = useCallback(async () => {
    setSaving(true);

    try {
      const { cid } = await saveInteractiveWorldToIpfs({ modelUrl, behaviorGraph });

      setCid(cid);
    } finally {
      setSaving(false);
    }
  }, [modelUrl, behaviorGraph]);

  return { cid, saveSceneToIpfs, saving };
};

const useInteractiveWorldMinter = ({
  worldCid,
  contractAddress,
  behaviorGraph,
}: {
  contractAddress: string;
  worldCid: string;
  behaviorGraph: GraphJSON;
}) => {
  const [args, setArgs] = useState(() => toMintArgs(worldCid, behaviorGraph, contractAddress));

  const { config, error, isError } = usePrepareContractWrite({
    address: contractAddress,
    abi,
    functionName: 'safeMint',
    args,
  });

  useEffect(() => {
    const args = toMintArgs(worldCid, behaviorGraph, contractAddress);
    console.log({ args });
    setArgs(args);
  }, [worldCid, behaviorGraph, contractAddress]);

  const { data, isLoading, isSuccess, write } = useContractWrite({
    ...config,
  });

  console.log({
    error,
    isError,
  });

  return { write, isSuccess, isLoading, isError, error };
};

export default useInteractiveWorldMinter;
