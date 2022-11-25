import { Suspense, useCallback } from 'react';
import Scene from './scene/Scene';
import '@rainbow-me/rainbowkit/styles.css';
import useMockSmartContractActions from './onChainWorld/useMockSmartContractActions';
import './styles/resizer.css';
import Controls from './flowEditor/components/Controls';
import Nav from './nav/Nav';
import PublishingControls from './web3/PublishingControls';
import useNodeSpecJson from './hooks/useNodeSpecJson';
import useRegistry from './hooks/useRegistry';
import useSetAndLoadModelFile, { exampleModelFileUrl } from './hooks/useSetAndLoadModelFile';
import useBehaveGraphFlow, { exampleBehaveGraphFileUrl } from './hooks/useBehaveGraphFlow';
import useEngine from './hooks/useEngine';
import useSceneModifier from './scene/useSceneModifier';
import Flow from './flowEditor/FlowEditorApp';
import SplitEditor from './SplitEditor';
import { examplePairs } from './flowEditor/components/LoadModal';
import { Registry } from '@behave-graph/core';
import useRegisterSmartContractActions from './onChainWorld/useRegisterSmartContractActions';

const [initialModelFile, initialBehaviorGraph] = examplePairs[0];

const initialModelFileUrl = exampleModelFileUrl(initialModelFile);
const initialBehaviorGraphUrl = exampleBehaveGraphFileUrl(initialBehaviorGraph);

function EditorAndScene({ web3Enabled }: { web3Enabled?: boolean }) {
  const smartContractActions = useMockSmartContractActions();
  const registerSmartContractActions = useRegisterSmartContractActions(smartContractActions);

  const { modelFile, setModelFile, gltf } = useSetAndLoadModelFile({
    initialFileUrl: initialModelFileUrl,
  });

  const { scene, animations, sceneOnClickListeners, registerSceneProfile } = useSceneModifier(gltf);

  const registerProfiles = useCallback(
    (registry: Registry) => {
      registerSmartContractActions(registry);
      registerSceneProfile(registry);
    },
    [registerSceneProfile, smartContractActions]
  );

  const { registry, lifecyleEmitter } = useRegistry({
    registerProfiles,
  });

  const specJson = useNodeSpecJson(registry);

  const { nodes, edges, onNodesChange, onEdgesChange, graphJson, setGraphJson } = useBehaveGraphFlow({
    initialGraphJsonUrl: initialBehaviorGraphUrl,
    specJson,
  });

  const { togglePlay, playing } = useEngine({
    graphJson,
    registry,
    eventEmitter: lifecyleEmitter,
  });

  const web3Controls = web3Enabled ? <PublishingControls graphJson={graphJson} modelFile={modelFile?.file} /> : null;

  const controls = specJson && (
    <Controls
      toggleRun={togglePlay}
      graphJson={graphJson}
      running={playing}
      additionalControls={web3Controls}
      setBehaviorGraph={setGraphJson}
      setModelFile={setModelFile}
    />
  );

  const flowEditor = specJson && (
    <Flow
      nodes={nodes}
      onNodesChange={onNodesChange}
      edges={edges}
      onEdgesChange={onEdgesChange}
      specJson={specJson}
      controls={controls}
      scene={scene}
    />
  );

  const interactiveModelPreview = gltf && (
    <Scene gltf={gltf} onClickListeners={sceneOnClickListeners} animationsState={animations} />
  );

  return (
    <>
      <Nav isWeb3Enabled={web3Enabled} />
      <div className="w-full h-full relative">
        <SplitEditor left={flowEditor} right={interactiveModelPreview} />
      </div>
    </>
  );
}

function EditorAndSceneWrapper(props: { web3Enabled?: boolean }) {
  return (
    <Suspense fallback={null}>
      <EditorAndScene {...props} />
    </Suspense>
  );
}

export default EditorAndSceneWrapper;
