import { useEffect } from 'react';
import { useAnimations } from '@react-three/drei';
import { AnimationAction } from 'three';
import { ObjectMap } from '@react-three/fiber';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationsState } from './useSceneModifier';

type AnimationActions = {
  [key: string]: AnimationAction | null;
};

const PlayAnimation = ({ name, actions }: { name: string; actions: AnimationActions }) => {
  useEffect(() => {
    const action = actions[name];
    if (!action) {
      console.error('invalid action name', name, 'had actions:', actions);
      return;
    }

    if (action.paused) action.paused = false;
    else action.play();

    // on unmount, pause the action
    return () => {
      action.paused = true;
    };
  }, [name, actions]);

  return null;
};

const ToggleAnimations = ({ gltf, animationsState }: { gltf: GLTF & ObjectMap; animationsState: AnimationsState }) => {
  const { actions: animationActions } = useAnimations(gltf.animations, gltf.scene);

  return (
    <>
      {Object.entries(animationsState)
        .filter(([, enabled]) => !!enabled)
        .map(([name]) => (
          <PlayAnimation key={name} name={name} actions={animationActions} />
        ))}
    </>
  );
};

export default ToggleAnimations;
