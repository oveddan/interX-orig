import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import FlowEditor from './flowEditor/FlowEditorApp';
import { buildGraphEvaluator, useRegistry } from './hooks/behaviorFlow';
import Scene from './scene/Scene';
import rawGraphJSON from './exampleGraphs/SpinningSuzanne.json';
import { GraphEvaluator, GraphJSON } from '@behavior-graph/framework';
import { behaveToFlow } from './flowEditor/transformers/behaveToFlow';
import { useEdgesState, useNodesState } from 'reactflow';
import '@rainbow-me/rainbowkit/styles.css';
import { flowToBehave } from './flowEditor/transformers/flowToBehave';
import useTokenContractAddress from './web3/useTokenContractAddressAndAbi';
import useLoadSceneAndRegistry from './hooks/useLoadSceneAndRegistry';
import Nav, { modelOptions } from './nav/Nav';

function EditorAndScene({
  modelUrl,
  rawGraphJSON,
  setModelUrl,
}: {
  modelUrl: string;
  rawGraphJSON: GraphJSON;
  setModelUrl: (url: string) => void;
}) {
  const { sceneJson, scene, sceneOnClickListeners, registry, specJson, lifecyleEmitter } = useLoadSceneAndRegistry({
    modelUrl,
  });
  const [initialNodes, initialEdges] = useMemo(() => behaveToFlow(rawGraphJSON), [rawGraphJSON]);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const [run, setRun] = useState(false);

  const [graphEvaluator, setGraphEvaluator] = useState<GraphEvaluator>();

  const [graphJson, setGraphJson] = useState<GraphJSON>();

  useEffect(() => {
    if (!specJson) return;
    const graphJson = flowToBehave({ nodes, edges, nodeSpecJSON: specJson });
    setGraphJson(graphJson);
  }, [nodes, edges, specJson]);

  useEffect(() => {
    if (!graphJson || !registry) return;

    const graphEvaluator = buildGraphEvaluator({ graphJson, registry });

    setGraphEvaluator(graphEvaluator);
  }, [graphJson, registry]);

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
          <Scene
            scene={sceneJson}
            graphEvaluator={graphEvaluator}
            lifecycleEmitter={lifecyleEmitter}
            run={run}
            onClickListeners={sceneOnClickListeners}
          />
        </div>
      </div>
    </div>
  );
}

function EditorAndSceneWrapper() {
  const [modelUrl, setModelUrl] = useState(() => modelOptions[0]);

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
      <EditorAndScene modelUrl={modelUrl} rawGraphJSON={rawGraphJSON as GraphJSON} setModelUrl={updateUrl} />
    </Suspense>
  );
}

export default EditorAndSceneWrapper;
