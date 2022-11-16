import { Engine, ILifecycleEventEmitter } from 'behave-graph';
import { OrbitControls, Stage, useCursor } from '@react-three/drei';
import { Canvas, ObjectMap } from '@react-three/fiber';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Mesh, MeshBasicMaterial, Object3D } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { OnClickListener, OnClickListeners } from './useSceneModifier';

const RegisterOnClickListenersOnElements = ({
  jsonPath,
  listeners,
  gltf,
  setHovered,
}: {
  jsonPath: string;
  listeners: OnClickListener;
  gltf: GLTF & ObjectMap;
  setHovered: (hovered: boolean) => void;
}) => {
  const [node, setNode] = useState<Mesh>();

  useEffect(() => {
    if (listeners.path.resource === 'nodes') {
      const node = gltf.nodes[listeners.path.index].clone() as Mesh;

      setNode(node);
      return;
    }
    setNode(undefined);
  }, [listeners.path, gltf]);

  const handleClick = useCallback(() => {
    listeners.callbacks.forEach((cb) => cb(jsonPath));
  }, [listeners.callbacks, jsonPath]);

  if (!node) return null;

  return (
    <primitive
      object={node}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  );
};

const Scene = ({ scene, onClickListeners }: { scene: GLTF & ObjectMap; onClickListeners: OnClickListeners }) => {
  const mainRef = useRef<Object3D>();
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, 'pointer', 'auto');

  return (
    <Canvas className="w-full h-full">
      <OrbitControls target={mainRef.current?.position} makeDefault />
      <Stage shadows adjustCamera intensity={1} environment="city" preset="rembrandt">
        <>
          <primitive object={scene.scene} ref={mainRef}>
            {Object.entries(onClickListeners).map(([jsonPath, listeners]) => (
              <RegisterOnClickListenersOnElements
                key={jsonPath}
                gltf={scene}
                jsonPath={jsonPath}
                listeners={listeners}
                setHovered={setHovered}
              />
            ))}
          </primitive>
        </>
      </Stage>
    </Canvas>
  );
};

export default Scene;
