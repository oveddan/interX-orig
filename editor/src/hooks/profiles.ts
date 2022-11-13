import { Registry } from 'behave-graph';
import { Vec2Value } from 'behave-graph/dist/lib/Profiles/Scene/Values/Vec2Value';
import { Vec3Value } from 'behave-graph/dist/lib/Profiles/Scene/Values/Vec3Value';
import { Vec4Value } from 'behave-graph/dist/lib/Profiles/Scene/Values/Vec4Value';
import { ColorValue } from 'behave-graph/dist/lib/Profiles/Scene/Values/ColorValue';
import { EulerValue } from 'behave-graph/dist/lib/Profiles/Scene/Values/EulerValue';
import { QuatValue } from 'behave-graph/dist/lib/Profiles/Scene/Values/QuatValue';
import { getNodeDescriptions } from 'behave-graph/dist/lib/Nodes/Registry/NodeDescription';
import * as Vec2Nodes from 'behave-graph/dist/lib/Profiles/Scene/Values/Vec2Value';
import * as Vec3Nodes from 'behave-graph/dist/lib/Profiles/Scene/Values/Vec3Value';
import * as Vec4Nodes from 'behave-graph/dist/lib/Profiles/Scene/Values/Vec4Value';
import * as ColorNodes from 'behave-graph/dist/lib/Profiles/Scene/Values/ColorNodes';
import * as EulerNodes from 'behave-graph/dist/lib/Profiles/Scene/Values/EulerNodes';
import * as QuatNodes from 'behave-graph/dist/lib/Profiles/Scene/Values/QuatNodes';
import { SetSceneProperty } from 'behave-graph/dist/lib/Profiles/Scene/Actions/SetSceneProperty';
import { GetSceneProperty } from 'behave-graph/dist/lib/Profiles/Scene/Queries/GetSceneProperty';
import { registerSerializersForValueType } from 'behave-graph/dist/lib/Profiles/Core/registerSerializersForValueType';
import { IScene, ISmartContractActions } from '../abstractions';
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
    registerSerializersForValueType(registry, valueTypeName);
  });
}

export function registerSpecificSceneProfiles(registry: Registry, scene: IScene) {
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
