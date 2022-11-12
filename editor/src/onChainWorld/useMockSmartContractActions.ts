import { useCallback, useMemo, useRef } from 'react';
import { ISmartContractActions } from '../abstractions';

type hn = { [id: string]: (count: number) => void };

const useMockSmartContractActions = () => {
  const actionExecutedHandlers = useRef<hn>({});

  const mockCounts = useRef<{ [id: string]: number }>({});

  const registerTriggerHandler = useCallback((id: string, cb: (count: number) => void) => {
    actionExecutedHandlers.current[id] = cb;
  }, []);

  const unRegisterTriggerHandler = useCallback((id: string, cb: (count: number) => void) => {
    delete actionExecutedHandlers.current[id];
  }, []);

  const invoke = useCallback(async (actionId: string) => {
    const newCount = (mockCounts.current[actionId] || 0) + 1;
    mockCounts.current[actionId] = newCount;

    const handler = actionExecutedHandlers.current[actionId];
    if (handler) {
      handler(newCount);
    }
  }, []);

  const smartContractAction = useMemo(() => {
    const result: ISmartContractActions = {
      invoke,
      registerTriggerHandler,
      unRegisterTriggerHandler,
    };

    return result;
  }, [invoke, registerTriggerHandler, unRegisterTriggerHandler]);

  return smartContractAction;
};

export default useMockSmartContractActions;
