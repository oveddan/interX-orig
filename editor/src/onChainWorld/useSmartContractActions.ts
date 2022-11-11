import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useContract, useContractEvent, useSigner } from 'wagmi';
import { abi } from '../contracts/abi';
import { BigNumber } from 'ethers';
import { ISmartContractActions } from '../abstractions';

type hn = { [id: string]: (count: number) => void };

const useSmartContractActions = (contractAddress: string, tokenId: number) => {
  const [activeActionId, setActiveActionId] = useState<string>('');

  const args = useMemo(() => [tokenId, activeActionId], [tokenId, activeActionId]);

  const { data: signer } = useSigner();

  const contract = useContract({
    address: contractAddress,
    abi,
    signerOrProvider: signer,
  });

  const [connectedContract, setConnected] = useState<typeof contract | undefined>();

  useEffect(() => {
    if (!contract || !signer) return;
    const result = contract?.connect(signer);

    // @ts-ignore
    setConnected(result);
  }, [contract, signer]);

  const actionExecutedHandlers = useRef<hn>({});

  useContractEvent({
    address: contractAddress,
    abi,
    eventName: 'ActionExecuted',
    listener: (executerAddress, actionTokenId, nodeId, actionCount) => {
      if (tokenId !== actionTokenId.toNumber()) return;

      const handler = actionExecutedHandlers.current[nodeId];
      if (handler) handler(actionCount.toNumber());
    },
  });
  // address: contractAddress,
  // abi,
  // functionName: 'executeAction',
  // on
  // });

  const registerTriggerHandler = useCallback((id: string, cb: (count: number) => void) => {
    actionExecutedHandlers.current[id] = cb;
  }, []);

  const unRegisterTriggerHandler = useCallback((id: string, cb: (count: number) => void) => {
    delete actionExecutedHandlers.current[id];
  }, []);

  const invoke = useCallback(
    async (actionId: string, connectedContract: typeof contract) => {
      if (!connectedContract) return;
      const transaction = await connectedContract.executeAction(BigNumber.from(tokenId), actionId);

      await transaction.wait();
    },
    [tokenId]
  );

  const smartContractAction = useMemo(() => {
    if (!connectedContract) return;
    const result: ISmartContractActions = {
      invoke: (actionId: string) => {
        if (!connectedContract) return;
        invoke(actionId, connectedContract);
      },
      registerTriggerHandler,
      unRegisterTriggerHandler,
    };

    return result;
  }, [invoke, registerTriggerHandler, unRegisterTriggerHandler, connectedContract]);

  return smartContractAction;
};

export default useSmartContractActions;
