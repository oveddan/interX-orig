import { Suspense, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import Scene from './scene/Scene';
// import rawGraphJSON from './exampleGraphs/TokenGatedClick.json';
import '@rainbow-me/rainbowkit/styles.css';
import useMockSmartContractActions from './onChainWorld/useMockSmartContractActions';
import './styles/resizer.css';
import { VscSplitVertical, VscSplitHorizontal } from 'react-icons/vsc';
import clsx from 'clsx';
import Controls from './flowEditor/components/Controls';
import GltfLoader from './scene/GltfLoader';
import Nav from './nav/Nav';
import PublishingControls from './web3/PublishingControls';
import useNodeSpecJson from './hooks/useNodeSpecJson';
import useRegistry from './hooks/useRegistry';
import useSetAndLoadModelFile from './hooks/useSetAndLoadModelFile';
import useBehaveGraphFlow from './hooks/useBehaveGraphFlow';
import useEngine from './hooks/useEngine';
import useSceneModifier from './scene/useSceneModifier';
import Flow from './flowEditor/FlowEditorApp';
import SplitEditor from './SplitEditor';

type splitDirection = 'vertical' | 'horizontal';

const TogglePaneButton = ({
  splitDirection,
  buttonSplitDirection,
  setSplitDirection,
  children,
}: TogglePangeButtonProps & {
  buttonSplitDirection: splitDirection;
  children: JSX.Element[];
}) => {
  const active = buttonSplitDirection === splitDirection;
  return (
    <button
      type="button"
      className={clsx('font-medium text-sm p-2 text-center inline-flex items-center mr-2', {
        'text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800':
          active,
        'text-gray-700 border border-gray-700 hover:bg-gray-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 dark:border-gray-500 dark:text-gray-500 dark:hover:text-white dark:focus:ring-gray-800':
          !active,
      })}
      onClick={() => setSplitDirection(buttonSplitDirection)}
    >
      {children}
    </button>
  );
};

type TogglePangeButtonProps = {
  splitDirection: 'vertical' | 'horizontal';
  setSplitDirection: (dir: splitDirection) => void;
};

const TogglePaneButtons = (props: TogglePangeButtonProps) => (
  <>
    <TogglePaneButton {...props} buttonSplitDirection="vertical">
      <VscSplitHorizontal />
      <span className="sr-only">Split Vertical</span>
    </TogglePaneButton>

    <TogglePaneButton {...props} buttonSplitDirection="horizontal">
      <VscSplitVertical />
      <span className="sr-only">Split Horizontal</span>
    </TogglePaneButton>
  </>
);

function EditorAndScene({ web3Enabled }: { web3Enabled?: boolean }) {
  const smartContractActions = useMockSmartContractActions();
  const { modelFile, setModelFile, gltf, setGltf } = useSetAndLoadModelFile();

  const { scene, animations, sceneOnClickListeners, registerSceneProfile } = useSceneModifier(gltf);

  const { registry, lifecyleEmitter } = useRegistry({
    registerProfiles: registerSceneProfile,
  });

  const specJson = useNodeSpecJson(registry);

  const { nodes, edges, onNodesChange, onEdgesChange, graphJson, setGraphJson } = useBehaveGraphFlow(specJson);

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

  const interactiveModelPreview = modelFile && (
    <Scene gltf={gltf} onClickListeners={sceneOnClickListeners} animationsState={animations} />
  );

  return (
    <>
      <Nav isWeb3Enabled={web3Enabled} />
      <div className="w-full h-full relative">
        <SplitEditor left={flowEditor} right={interactiveModelPreview} />
      </div>
      {/* @ts-ignore */}
      <GltfLoader fileUrl={modelFile?.dataUri} setGltf={setGltf} />
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
