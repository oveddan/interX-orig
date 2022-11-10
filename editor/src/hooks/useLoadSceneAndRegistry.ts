import { ObjectMap } from '@react-three/fiber';
import { GLTF } from 'three-stdlib';
import useSceneModifier from '../scene/useSceneModifier';
import { useRegistry } from './behaviorFlow';
import { ISmartContractActions } from '../abstractions';

const useLoadSceneAndRegistry = ({
  smartContractActions,
  gltf,
}: {
  smartContractActions: ISmartContractActions;
  gltf?: GLTF & ObjectMap;
}) => {
  const { scene, animations, sceneOnClickListeners } = useSceneModifier(gltf);

  const { registry, specJson, lifecyleEmitter } = useRegistry({ scene, smartContractActions });

  return {
    scene,
    animations,
    sceneOnClickListeners,
    registry,
    specJson,
    lifecyleEmitter,
  };
};

export default useLoadSceneAndRegistry;
