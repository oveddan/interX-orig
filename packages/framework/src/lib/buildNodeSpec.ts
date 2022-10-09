import { Logger } from './Diagnostics/Logger.js';
import { writeNodeSpecsToJSON } from './Graphs/IO/writeNodeSpecsToJSON.js';
import { validateNodeRegistry } from './Nodes/Validation/validateNodeRegistry.js';
import { registerCoreProfile } from './Profiles/Core/registerCoreProfile.js';
import { registerSceneProfile } from './Profiles/Scene/registerSceneProfile.js';
import { Registry } from './Registry.js';
import { DummyScene } from '../examples/exec-graph/DummyScene.js';
import { DefaultLogger, ManualLifecycleEventEmitter } from '../index.js';

export function buildNodeSpec() {
  const registry = new Registry();
  const eventemitter = new ManualLifecycleEventEmitter();
  registerCoreProfile(registry, new DefaultLogger(), eventemitter);
  registerSceneProfile(registry, eventemitter, new DummyScene(registry));

  const errorList: string[] = [];
  errorList.push(...validateNodeRegistry(registry));
  if (errorList.length > 0) {
    Logger.error(`${errorList.length} errors found:`);
    errorList.forEach((errorText, errorIndex) => {
      Logger.error(`${errorIndex}: ${errorText}`);
    });
    return;
  }

  const nodeSpecJson = writeNodeSpecsToJSON(registry);
  nodeSpecJson.sort((a, b) => a.type.localeCompare(b.type));

  return nodeSpecJson;
}
