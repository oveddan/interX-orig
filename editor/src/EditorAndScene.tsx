import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import FlowEditor from './flowEditor/FlowEditorApp';
import { useSceneModificationEngine } from './hooks/behaviorFlow';
import Scene from './scene/Scene';
// import rawGraphJSON from './exampleGraphs/TokenGatedClick.json';
import rawGraphJSON from './exampleGraphs/AnimateAnimation.json';
import { GraphJSON } from 'behave-graph';
import '@rainbow-me/rainbowkit/styles.css';
import { flowToBehave } from './flowEditor/transformers/flowToBehave';
import useTokenContractAddress from './web3/useTokenContractAddressAndAbi';
import useLoadSceneAndRegistry from './hooks/useLoadSceneAndRegistry';
import Nav, { modelOptions } from './nav/Nav';
import { useBehaveToFlow } from './hooks/useBehaveToFlow';
import useMockSmartContractActions from './onChainWorld/useMockSmartContractActions';

function EditorAndScene({
  modelUrl,
  rawGraphJSON,
  setModelUrl,
}: {
  modelUrl: string;
  rawGraphJSON: GraphJSON;
  setModelUrl: (url: string) => void;
}) {
  const smartContractActions = useMockSmartContractActions();
  const { sceneJson, scene, animations, sceneOnClickListeners, registry, specJson, lifecyleEmitter } =
    useLoadSceneAndRegistry({
      modelUrl,
      smartContractActions,
    });

  const { nodes, edges, onNodesChange, onEdgesChange } = useBehaveToFlow(rawGraphJSON);

  const [run, setRun] = useState(false);

  const [graphJson, setGraphJson] = useState<GraphJSON>();

  useEffect(() => {
    if (!specJson) return;
    const graphJson = flowToBehave({ nodes, edges, nodeSpecJSON: specJson });
    setGraphJson(graphJson);
  }, [nodes, edges, specJson]);

  useSceneModificationEngine({
    graphJson,
    registry,
    eventEmitter: lifecyleEmitter,
    run,
  });

  const toggleRun = useCallback(() => {
    setRun((existing) => !existing);
  }, []);

  const contractAddress = useTokenContractAddress();

  return (
    <div className="h-full grid grid-cols-2 gap-0">
      <div className="bg-lime-500 h-full">
        {specJson && scene && (
          <FlowEditor
            toggleRun={toggleRun}
            registry={registry}
            nodes={nodes}
            onNodesChange={onNodesChange}
            edges={edges}
            onEdgesChange={onEdgesChange}
            specJson={specJson}
            running={run}
            scene={scene}
          />
        )}
      </div>
      <div className="h-full grid">
        <div className="row-span-1">
          <Nav contractAddress={contractAddress} graphJson={graphJson} modelUrl={modelUrl} setModelUrl={setModelUrl} />
        </div>
        <div className="row-span-6">
          <Scene scene={sceneJson} onClickListeners={sceneOnClickListeners} animationsState={animations} />
        </div>
      </div>
    </div>
  );
}

// @ts-ignore
const graphJson = rawGraphJSON as GraphJSON;

function EditorAndSceneWrapper() {
  const [modelUrl, setModelUrl] = useState(() => modelOptions[1]);

  const [refresh, setRefresh] = useState(false);

  const updateUrl = useCallback((url: string) => {
    setRefresh(true);
    setModelUrl(url);

    setTimeout(() => {
      setRefresh(false);
    }, 100);
  }, []);

  if (refresh) return null;

  return (
    <Suspense fallback={null}>
      <EditorAndScene modelUrl={modelUrl} rawGraphJSON={graphJson} setModelUrl={updateUrl} />
    </Suspense>
  );
}

export default EditorAndSceneWrapper;
