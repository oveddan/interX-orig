import {
  Registry,
  Vec2Value,
  Vec3Value,
  Vec4Value,
  ColorValue,
  EulerValue,
  QuatValue,
  getNodeDescriptions,
  Vec2Nodes,
  Vec3Nodes,
  Vec4Nodes,
  ColorNodes,
  EulerNodes,
  QuatNodes,
  SetSceneProperty,
  GetSceneProperty,
  IScene,
} from '@behave-graph/core';
import { registerSerializersForValueType } from '@behave-graph/core/src/Profiles/Core/registerSerializersForValueType';
import { ISceneWithQueries, ISmartContractActions } from '../abstractions';
import { OnSceneNodeClick } from '../nodes/scene/OnSceneNodeClick';
import { OnSmartActionInvoked } from '../nodes/smartContracts/OnSmartActionInvoked';
import { TokenGatedActionInvoker } from '../nodes/smartContracts/TokenGatedActionInvoker';

export function registerSharedSceneProfiles(registry: Registry, scene: IScene) {
  const { values, nodes } = registry;

  // pull in value type nodes
  values.register(Vec2Value);
  values.register(Vec3Value);
  values.register(Vec4Value);
  values.register(ColorValue);
  values.register(EulerValue);
  values.register(QuatValue);

  // pull in value type nodes
  nodes.register(...getNodeDescriptions(Vec2Nodes));
  nodes.register(...getNodeDescriptions(Vec3Nodes));
  nodes.register(...getNodeDescriptions(Vec4Nodes));
  nodes.register(...getNodeDescriptions(ColorNodes));
  nodes.register(...getNodeDescriptions(EulerNodes));
  nodes.register(...getNodeDescriptions(QuatNodes));

  // // actions
  const allValueTypeNames = values.getAllNames();
  nodes.register(...SetSceneProperty.GetDescriptions(scene, ...allValueTypeNames));
  nodes.register(...GetSceneProperty.GetDescriptions(scene, ...allValueTypeNames));

  const newValueTypeNames = ['vec2', 'vec3', 'vec4', 'quat', 'euler', 'color'];

  // variables

  newValueTypeNames.forEach((valueTypeName) => {
    registerSerializersForValueType(
      // @ts-ignore
      registry,
      valueTypeName
    );
  });
}

export function registerSpecificSceneProfiles(registry: Registry, scene: ISceneWithQueries) {
  const { nodes } = registry;

  // TODO: register scene node types with IScene.

  nodes.register(OnSceneNodeClick.Description(scene));
}

export function registerSmartContractActions(registry: Registry, actions: ISmartContractActions) {
  const { nodes } = registry;

  // TODO: register scene node types with IScene.

  nodes.register(TokenGatedActionInvoker.Description(actions));
  nodes.register(OnSmartActionInvoked.Description(actions));
}
