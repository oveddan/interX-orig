import { ObjectMap } from '@react-three/fiber';
import { Vec3, Vec4 } from 'behave-graph';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { Material, MeshBasicMaterial, Object3D, Quaternion, Vector3, Vector4 } from 'three';
import { IScene, Properties } from '../abstractions';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTFJson } from './GLTFJson';

function toVec3(value: Vector3): Vec3 {
  return new Vec3(value.x, value.y, value.z);
}
function toVec4(value: Vector4 | Quaternion): Vec4 {
  return new Vec4(value.x, value.y, value.z, value.w);
}

const shortPathRegEx = /^\/?(?<resource>[^/]+)\/(?<index>\d+)$/;
const jsonPathRegEx = /^\/?(?<resource>[^/]+)\/(?<index>\d+)\/(?<property>[^/]+)$/;
export type ResourceTypes = 'nodes' | 'materials';

export type Optional<T> = {
  [K in keyof T]: T[K] | undefined;
};

export type Path = {
  resource: ResourceTypes;
  index: number;
  property: string;
};

export function toJsonPathString({ index, property, resource: resourceType }: Optional<Path>, short: boolean) {
  if (short) {
    if (!resourceType || !index) return;
    return `${resourceType}/${index}`;
  } else {
    if (!resourceType || !index || !property) return;
    return `${resourceType}/${index}/${property}`;
  }
}

export function parseJsonPath(jsonPath: string, short = false): Path {
  // hack = for now we see if there are 2 segments to know if its short
  const regex = short ? shortPathRegEx : jsonPathRegEx;
  const matches = regex.exec(jsonPath);
  if (matches === null) throw new Error(`can not parse jsonPath: ${jsonPath}`);
  if (matches.groups === undefined) throw new Error(`can not parse jsonPath (no groups): ${jsonPath}`);
  return {
    resource: matches.groups.resource as ResourceTypes,
    index: +matches.groups.name,
    property: matches.groups.property,
  };
}

function applyPropertyToModel({ resource, index: name, property }: Path, gltf: GLTF & ObjectMap, value: any) {
  if (resource === 'nodes') {
    const node = gltf.nodes[name];

    if (!node) {
      console.error(`no node at path ${name}`);
      return;
    }

    applyNodeModifier(property, node, value);

    return;
  }
  if (resource === 'materials') {
    const node = gltf.materials[name];

    if (!node) {
      console.error(`no node at path ${name}`);
      return;
    }

    applyMaterialModifier(property, node, value);

    return;
  }

  console.error(`unknown resource type ${resource}`);
}

function getPropertyFromModel({ resource, index: name, property }: Path, gltf: GLTF & ObjectMap) {
  if (resource === 'nodes') {
    const node = gltf.nodes[name];

    if (!node) {
      console.error(`no node at path ${name}`);
      return;
    }

    getPropertyValue(property, node);

    return;
  }
}

function applyNodeModifier(property: string, objectRef: Object3D, value: any) {
  switch (property) {
    case 'visible': {
      objectRef.visible = value as boolean;
      break;
    }
    case 'translation': {
      const v = value as Vec3;
      objectRef.position.set(v.x, v.y, v.z);
      break;
    }
    case 'scale': {
      const v = value as Vec3;
      objectRef.scale.set(v.x, v.y, v.z);
      break;
    }
    case 'rotation': {
      const v = value as Vec4;
      objectRef.quaternion.set(v.x, v.y, v.z, v.w);
      break;
    }
  }
}

function applyMaterialModifier(property: string, materialRef: Material, value: any) {
  switch (property) {
    case 'color': {
      const basic = materialRef as MeshBasicMaterial;

      if (basic.color) {
        const v = value as Vec3;
        basic.color.setRGB(v.x, v.y, v.z);
        basic.needsUpdate = true;
      }
      break;
    }
  }
}

function getPropertyValue(property: string, objectRef: Object3D) {
  switch (property) {
    case 'visible': {
      return objectRef.visible;
    }
    case 'translation': {
      return toVec3(objectRef.position);
    }
    case 'scale': {
      return toVec3(objectRef.scale);
    }
    case 'rotation': {
      return toVec4(objectRef.quaternion);
    }
    default:
      throw new Error(`unrecognized property: ${property}`);
  }
}

export type OnClickCallback = (jsonPath: string) => void;

export type OnClickListener = {
  path: Path;
  callbacks: OnClickCallback[];
};

export type OnClickListeners = {
  [jsonPath: string]: OnClickListener;
};

const buildSceneModifier = (
  gltf: GLTF & ObjectMap,
  setOnClickListeners: Dispatch<SetStateAction<OnClickListeners>>
) => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function

  // clear listenerrs at first
  const addOnClickedListener = (jsonPath: string, callback: (jsonPath: string) => void) => {
    const path = parseJsonPath(jsonPath, true);

    setOnClickListeners((existing) => {
      const listenersForPath = existing[jsonPath] || {
        path,
        callbacks: [],
      };

      const updatedListeners: OnClickListener = {
        ...listenersForPath,
        callbacks: [...listenersForPath.callbacks, callback],
      };

      const result: OnClickListeners = {
        ...existing,
        [jsonPath]: updatedListeners,
      };

      return result;
    });
  };

  const removeOnClickedListener = (jsonPath: string, callback: (jsonPath: string) => void) => {
    setOnClickListeners((existing) => {
      const listenersForPath = existing[jsonPath];

      if (!listenersForPath) return existing;

      const updatedCallbacks = listenersForPath.callbacks.filter((x) => x !== callback);

      if (updatedCallbacks.length > 0) {
        const updatedListeners = {
          ...listenersForPath,
          callback: updatedCallbacks,
        };

        return {
          ...existing,
          [jsonPath]: updatedListeners,
        };
      }

      const result = {
        ...existing,
      };

      delete result[jsonPath];

      return result;
    });
  };

  const getProperty = (jsonPath: string, valueTypeName: string) => {
    const path = parseJsonPath(jsonPath);

    return getPropertyFromModel(path, gltf);
  };

  const setProperty = (jsonPath: string, valueTypeName: string, value: any) => {
    const path = parseJsonPath(jsonPath);

    applyPropertyToModel(path, gltf, value);
  };

  const getProperties = (): Properties => {
    const nodeProperties = ['visible', 'translation', 'scale', 'rotation', 'color'];
    const animationProperties = ['enabled'];
    const materialProperties = ['color'];

    const gltfJson = gltf.parser.json as GLTFJson;
    const nodeOptions = gltfJson.nodes.map(({ name }, index) => ({ name: name || index.toString(), index }));
    const materialOptions = gltfJson.materials.map(({ name }, index) => ({ name: name || index.toString(), index }));
    const animationOptions = gltf.animations.map(({ name }, index) => ({ name: name || index.toString(), index }));

    const properties: Properties = {
      nodes: { options: nodeOptions, properties: nodeProperties },
      animations: { options: animationOptions, properties: animationProperties },
      materials: { options: materialOptions, properties: materialProperties },
    };

    return properties;
  };

  const scene: IScene = {
    getProperty,
    setProperty,
    getProperties,
    addOnClickedListener,
    removeOnClickedListener,
  };

  return scene;
};

const useSceneModifier = (gltf: GLTF & ObjectMap, setOnClickListeners: Dispatch<SetStateAction<OnClickListeners>>) => {
  const [scene, setScene] = useState<IScene>();

  useEffect(() => {
    setScene(buildSceneModifier(gltf, setOnClickListeners));
  }, [gltf, setOnClickListeners]);

  return scene;
};

export default useSceneModifier;
