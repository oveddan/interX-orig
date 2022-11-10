import { Registry } from '@behave-graph/core';
import { useCallback } from 'react';
import { ISmartContractActions } from '../abstractions';
import { registerSmartContractActions } from '../hooks/profiles';

const useRegisterSmartContractActions = (actions: ISmartContractActions) => {
  const register = useCallback(
    (registry: Registry) => {
      registerSmartContractActions(registry, actions);
    },
    [actions]
  );

  return register;
};

export default useRegisterSmartContractActions;
