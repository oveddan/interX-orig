import { ObjectMap } from '@react-three/fiber';
import { IScene, Vec3, Vec4, Properties, ResourceProperties } from '@behavior-graph/framework';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { Color, Material, MeshBasicMaterial, Object3D, Quaternion, Vector3, Vector4 } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

function toVec3(value: Vector3): Vec3 {
  return new Vec3(value.x, value.y, value.z);
}
function toVec4(value: Vector4 | Quaternion): Vec4 {
  return new Vec4(value.x, value.y, value.z, value.w);
}

const shortPathRegEx = /^\/?(?<resource>[^/]+)\/(?<name>[^/]+)$/;
const jsonPathRegEx = /^\/?(?<resource>[^/]+)\/(?<name>[^/]+)\/(?<property>[^/]+)$/;
export type ResourceTypes = 'nodes' | 'materials';
export type Path = {
  resource: ResourceTypes;
  name: string;
  property: string;
};

export function parseJsonPath(jsonPath: string, short = false): Path {
  // hack = for now we see if there are 2 segments to know if its short
  const isShort = jsonPath.split('/').length === 2;
  const regex = isShort ? shortPathRegEx : jsonPathRegEx;
  const matches = regex.exec(jsonPath);
  if (matches === null) throw new Error(`can not parse jsonPath: ${jsonPath}`);
  if (matches.groups === undefined) throw new Error(`can not parse jsonPath (no groups): ${jsonPath}`);
  return {
    resource: matches.groups.resource as ResourceTypes,
    name: matches.groups.name,
    property: matches.groups.property,
  };
}

function applyPropertyToModel({ resource, name, property }: Path, gltf: GLTF & ObjectMap, value: any) {
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

function getPropertyFromModel({ resource, name, property }: Path, gltf: GLTF & ObjectMap) {
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

export type OnClickListener = {
  path: Path;
  jsonPath: string;
  callback: (jsonPath: string) => void;
};

const buildSceneModifier = (
  gltf: GLTF & ObjectMap,
  setOnClickListeners: Dispatch<SetStateAction<OnClickListener[]>>
) => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function

  // clear listenerrs at first
  setOnClickListeners([]);

  const addOnClickedListener = (jsonPath: string, callback: (jsonPath: string) => void) => {
    const path = parseJsonPath(jsonPath);

    const newListner: OnClickListener = {
      path,
      jsonPath,
      callback,
    };

    setOnClickListeners((existing) => [...existing, newListner]);
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
    const materialProperties = ['color'];

    const nodeNames = Object.entries(gltf.nodes).map(([name]) => name);
    const materialNames = Object.entries(gltf.materials).map(([name]) => name);

    const properties: Properties = {
      nodes: { names: nodeNames, properties: nodeProperties },
      materials: { names: materialNames, properties: materialProperties },
    };

    return properties;
  };

  const scene: IScene = {
    getProperty,
    setProperty,
    getProperties,
    addOnClickedListener,
  };

  return scene;
};

const useSceneModifier = (gltf: GLTF & ObjectMap, setOnClickListeners: Dispatch<SetStateAction<OnClickListener[]>>) => {
  const [scene, setScene] = useState<IScene>();

  useEffect(() => {
    setScene(buildSceneModifier(gltf, setOnClickListeners));
  }, [gltf, setOnClickListeners]);

  return scene;
};

export default useSceneModifier;
