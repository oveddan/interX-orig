import { useState } from 'react';
import { useGLTF } from '@react-three/drei';
import useSceneModifier, { OnClickListener, OnClickListeners } from '../scene/useSceneModifier';
import { useRegistry } from './behaviorFlow';
import { ISmartContractActions } from '../abstractions';

const useLoadSceneAndRegistry = ({
  modelUrl,
  smartContractActions,
}: {
  modelUrl: string;
  smartContractActions: ISmartContractActions;
}) => {
  const sceneJson = useGLTF(modelUrl);

  const [sceneOnClickListeners, setSceneOnClickListeners] = useState<OnClickListeners>({});

  const scene = useSceneModifier(sceneJson, setSceneOnClickListeners);

  const { registry, specJson, lifecyleEmitter } = useRegistry({ scene, smartContractActions });

  return {
    sceneJson,
    scene,
    sceneOnClickListeners,
    registry,
    specJson,
    lifecyleEmitter,
  };
};

export default useLoadSceneAndRegistry;
