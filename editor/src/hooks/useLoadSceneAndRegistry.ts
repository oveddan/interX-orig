import { ObjectMap } from '@react-three/fiber';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { useState } from 'react';
import useSceneModifier, { OnClickListener, OnClickListeners } from '../scene/useSceneModifier';
import { useRegistry } from './behaviorFlow';
import { ISmartContractActions } from '../abstractions';

const useLoadSceneAndRegistry = ({
  smartContractActions,
  gltf,
}: {
  smartContractActions: ISmartContractActions;
  gltf: GLTF & ObjectMap;
}) => {
  const [sceneOnClickListeners, setSceneOnClickListeners] = useState<OnClickListeners>({});

  const { scene, animations } = useSceneModifier(gltf, setSceneOnClickListeners);

  const { registry, specJson, lifecyleEmitter } = useRegistry({ scene, smartContractActions });

  return {
    sceneJson: gltf,
    scene,
    animations,
    sceneOnClickListeners,
    registry,
    specJson,
    lifecyleEmitter,
  };
};

export default useLoadSceneAndRegistry;
