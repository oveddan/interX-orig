import {
  DefaultLogger,
  Engine,
  Graph,
  GraphJSON,
  ILifecycleEventEmitter,
  ILogger,
  ManualLifecycleEventEmitter,
  NodeSpecJSON,
  readGraphFromJSON,
  registerCoreProfile,
  Registry,
} from 'behave-graph';
import { useEffect, useState } from 'react';
import { getNodeSpecJSON } from '../flowEditor/util/getNodeSpecJSON';
import { IScene, ISmartContractActions } from '../abstractions';
import { registerSharedSceneProfiles, registerSmartContractActions, registerSpecificSceneProfiles } from './profiles';

export const useRegistry = ({
  scene,
  smartContractActions,
}: {
  scene: IScene | undefined;
  smartContractActions: ISmartContractActions;
}) => {
  const [registry, setRegistry] = useState<Registry>();

  const [lifecyleEmitter, setLifecycleEmitter] = useState<ILifecycleEventEmitter>(new ManualLifecycleEventEmitter());
  const [logger] = useState<ILogger>(new DefaultLogger());

  const [specJson, setSpecJson] = useState<NodeSpecJSON[]>();

  useEffect(() => {
    if (!scene) return;
    const registry = new Registry();
    const lifecyleEmitter = new ManualLifecycleEventEmitter();
    registerCoreProfile(registry, logger, lifecyleEmitter);
    registerSharedSceneProfiles(registry, scene);
    registerSpecificSceneProfiles(registry, scene);
    registerSmartContractActions(registry, smartContractActions);
    const specJson = getNodeSpecJSON(registry);

    setRegistry(registry);
    setSpecJson(specJson);
    setLifecycleEmitter(lifecyleEmitter);
  }, [scene, smartContractActions, logger]);

  return { registry, specJson, lifecyleEmitter, logger };
};

export const useGraph = (graphJson: GraphJSON | undefined, registry: Registry | undefined) => {
  const [graph, setGraph] = useState<Graph>();

  useEffect(() => {
    if (!graphJson || !registry) {
      setGraph(undefined);
      return;
    }

    setGraph(readGraphFromJSON(graphJson, registry));
  }, [graphJson, registry]);

  return graph;
};

export const useSceneModificationEngine = ({
  graphJson,
  registry,
  eventEmitter,
  run,
}: {
  graphJson: GraphJSON | undefined;
  registry: Registry | undefined;
  eventEmitter: ILifecycleEventEmitter;
  run: boolean;
}) => {
  const [engine, setEngine] = useState<Engine>();

  useEffect(() => {
    if (!graphJson || !registry || !run) return;

    const graph = readGraphFromJSON(graphJson, registry);
    const engine = new Engine(graph);

    setEngine(engine);

    return () => {
      engine.dispose();
      setEngine(undefined);
    };
  }, [graphJson, registry, run]);

  useEffect(() => {
    if (!engine || !run) return;

    engine.executeAllSync();

    let timeout: number;

    const onTick = async () => {
      eventEmitter.tickEvent.emit();

      // eslint-disable-next-line no-await-in-loop
      await engine.executeAllAsync(500);

      timeout = window.setTimeout(onTick, 50);
    };

    (async () => {
      if (eventEmitter.startEvent.listenerCount > 0) {
        eventEmitter.startEvent.emit();

        await engine.executeAllAsync(5);
      } else {
        console.log('has no listener count');
      }
      onTick();
    })();

    return () => {
      console.log('clear timeout');
      window.clearTimeout(timeout);
    };
  }, [eventEmitter, engine, run]);

  return engine;
};
